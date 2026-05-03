<template>
  <span :class="['badge', cls]">{{ label }}</span>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({ status: String });

const map = {
  pending:               { cls: "badge--warning", label: "Pending" },
  accepted_by_company:   { cls: "badge--success", label: "Accepted" },
  rejected_by_company:   { cls: "badge--danger",  label: "Rejected" },
  rejected_by_admin:     { cls: "badge--danger",  label: "Rejected by Admin" },
  pending_admin:         { cls: "badge--warning", label: "Pending Admin" },
  validated:             { cls: "badge--gold",    label: "Validated" },
  withdrawn:             { cls: "badge--neutral", label: "Withdrawn" },
};

const entry = computed(() => map[props.status] ?? { cls: "badge--neutral", label: props.status ?? "—" });
const cls   = computed(() => entry.value.cls);
const label = computed(() => entry.value.label);
</script>