from django.contrib import admin
from .models import (
    User, TypeOfInstruction, Instruction, InstructionAgreement,
    Tests, Question, Answer, TestResult, InstructionResult, Video,
    ReferenceLink, UserAnswer
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


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_correct', 'question')
    search_fields = ('name',)


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'is_passed', 'mark', 'score')
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
    list_display = ('test_result', 'question', 'selected_answer', 'is_correct', 'points_earned')
    search_fields = ('test_result__user__email', 'question__name', 'selected_answer__name')
    list_filter = ('is_correct',)
