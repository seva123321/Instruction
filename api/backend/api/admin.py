from django.contrib import admin
from django.db.models.aggregates import Count, Avg
from django.db.models.expressions import F
from django.db.models import CharField, Value
from django.db.models.functions import Concat
from django.db.models.query_utils import Q


from .models import (
    User,
    TypeOfInstruction,
    Instruction,
    InstructionAgreement,
    Tests,
    Question,
    Answer,
    TestResult,
    InstructionResult,
    Video,
    ReferenceLink,
    UserAnswer,
    NormativeLegislation,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('role',)


@admin.register(TypeOfInstruction)
class TypeOfInstructionAdmin(admin.ModelAdmin):
    list_display = ('name', 'frequency_of_passage')
    search_fields = ('name',)


@admin.register(Instruction)
class InstructionAdmin(admin.ModelAdmin):
    list_display = ('name', 'type_of_instruction')
    search_fields = ('name', 'type_of_instruction__name')


@admin.register(InstructionAgreement)
class InstructionAgreementAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('email',)


class QuestionInline(admin.TabularInline):
    model = Question


@admin.register(Tests)
class TestsAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'passing_score', 'test_is_control')
    search_fields = ('name',)
    inlines = (QuestionInline,)


class AnswerInline(admin.TabularInline):
    model = Answer


class ReferenceLinkInline(admin.TabularInline):
    model = ReferenceLink


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('name', 'tests')
    search_fields = ('name', 'tests__name')
    inlines = (ReferenceLinkInline, AnswerInline)

@admin.register(ReferenceLink)
class ReferenceLinkAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'question')
    search_fields = ('name',)

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_correct', 'question')
    search_fields = ('name',)


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'is_passed', 'mark', 'score', 'completion_time')
    search_fields = ('user__email', 'test__name')


@admin.register(InstructionResult)
class InstructionResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'instruction', 'result', 'date', 'time')
    search_fields = ('user__email', 'instruction__name')


@admin.register(Video)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('title', 'url', 'file')
    search_fields = ('name',)


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = (
        'test_result',
        'question',
        'selected_answer',
        'is_correct',
        'points_earned',
    )
    search_fields = (
        'test_result__user__email',
        'question__name',
        'selected_answer__name',
    )
    list_filter = ('is_correct',)


@admin.register(NormativeLegislation)
class NormativeLegislationAdmin(admin.ModelAdmin):
    list_display = ('title', 'date')
    search_fields = ('title', 'description')
    list_filter = ('date',)


def dashboard_callback(request, context):
    # Статистика по тестам
    test_stats = TestResult.objects.aggregate(
        total=Count('id'),
        passed=Count('id', filter=Q(is_passed=True)),
        failed=Count('id', filter=Q(is_passed=False)),
        avg_score=Avg('score')
    )

    # Статистика по инструктажам
    instruction_stats = InstructionResult.objects.aggregate(
        total=Count('id'),
        passed=Count('id', filter=Q(result=True)),
        failed=Count('id', filter=Q(result=False))
    )

    # Последние проваленные тесты
    recent_failed_tests = TestResult.objects.filter(
        is_passed=False
    ).select_related('user', 'test')[:5]

    # Последние проваленные инструктажи
    recent_failed_instructions = InstructionResult.objects.filter(
        result=False
    ).select_related('user', 'instruction')[:5]

    # Проблемные вопросы (топ 5)
    problematic_questions = (
        UserAnswer.objects
        .filter(is_correct=False)
        .values('question__name')
        .annotate(
            total_errors=Count('id'),
            question_id=F('question__id')
        )
        .order_by('-total_errors')[:5]
    )

    # Слабоквалифицированные сотрудники (топ 5)
    test_fails = (
        TestResult.objects.filter(is_passed=False)
        .annotate(
            user_name=Concat(
                "user__last_name",
                Value(" "),
                "user__first_name",
                output_field=CharField(),
            )
        )
        .values("user")
        .annotate(test_fails=Count("id"), user_name=F("user_name"))
    )

    # Для instruction_fails
    instruction_fails = (
        InstructionResult.objects.filter(result=False)
        .annotate(
            user_name=Concat(
                "user__last_name",
                Value(" "),
                "user__first_name",
                output_field=CharField(),
            )
        )
        .values("user")
        .annotate(instruction_fails=Count("id"), user_name=F("user_name"))
    )

    # Объединяем результаты
    from collections import defaultdict
    user_stats = defaultdict(lambda: {'test_fails': 0, 'instruction_fails': 0})

    for entry in test_fails:
        user_stats[entry['user']]['test_fails'] = entry['test_fails']
        user_stats[entry['user']]['user_name'] = entry['user_name']

    for entry in instruction_fails:
        user_stats[entry['user']]['instruction_fails'] = entry['instruction_fails']
        user_stats[entry['user']]['user_name'] = entry['user_name']

    # Сортируем по общему количеству провалов
    weak_users = sorted(
        user_stats.values(),
        key=lambda x: (x['test_fails'] + x['instruction_fails']),
        reverse=True
    )[:5]

    context.update(
        {
            "problematic_questions": problematic_questions,
            "weak_users": weak_users,
            "test_stats": test_stats,
            "instruction_stats": instruction_stats,
            "recent_failed_tests": recent_failed_tests,
            "recent_failed_instructions": recent_failed_instructions,
        }
    )
    return context