from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TestResult, InstructionResult


@receiver(post_save, sender=TestResult)
def handle_test_result(sender, instance, created, **kwargs):
    if created:
        instance.create_notification()


@receiver(post_save, sender=InstructionResult)
def handle_instruction_result(sender, instance, created, **kwargs):
    if created:
        instance.create_notification()
