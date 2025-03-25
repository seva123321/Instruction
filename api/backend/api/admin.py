from django.contrib import admin
from .models import (
    User, TypeOfInstruction, Instruction, InstructionAgreement,
    Tests, Question, Answer, TestResult, InstructionResult, Media
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
    list_display = ('date',)
    search_fields = ('email',)


class QuestionInline(admin.TabularInline):
    model = Question


@admin.register(Tests)
class TestsAdmin(admin.ModelAdmin):
    list_display = ('name', 'passing_score')
    search_fields = ('name',)
    inlines = (QuestionInline,)


class AnswerInline(admin.TabularInline):
    model = Answer


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('name', 'tests')
    search_fields = ('name', 'tests__name')
    inlines = (AnswerInline,)


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_correct', 'question')
    search_fields = ('name',)


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'test', 'result', 'date', 'time')
    search_fields = ('user__email', 'test__name')


@admin.register(InstructionResult)
class InstructionResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'instruction', 'result', 'date', 'time')
    search_fields = ('user__email', 'instruction__name')


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('name', 'file')
    search_fields = ('name',)
