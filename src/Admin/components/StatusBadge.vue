<template>
  <span :class="['badge', cls]">{{ label }}</span>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({ status: String });

const map = {
  pending_admin:       { cls: "badge--warning", label: "Pending Admin"   },
  validated:           { cls: "badge--success", label: "Validated"       },
  rejected_by_admin:   { cls: "badge--danger",  label: "Rejected"        },
  accepted_by_company: { cls: "badge--info",    label: "Accepted"        },
  rejected_by_company: { cls: "badge--danger",  label: "Rejected"        },
  pending:             { cls: "badge--warning", label: "Pending"         },
  withdrawn:           { cls: "badge--neutral", label: "Withdrawn"       },
};

const entry = computed(() => map[props.status] ?? { cls: "badge--neutral", label: props.status ?? "—" });
const cls   = computed(() => entry.value.cls);
const label = computed(() => entry.value.label);
</script>