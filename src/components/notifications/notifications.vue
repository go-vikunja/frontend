<template>
  <div class="notifications">
    <slot name="trigger" :has-unread-notifications="unreadNotifications > 0">
      <BaseButton class="trigger-button" @click.stop="toggleNotifications">
        <span class="unread-indicator" v-if="unreadNotifications > 0"></span>
        <icon icon="bell"/>
      </BaseButton>
    </slot>

    <CustomTransition name="fade">
      <div class="notifications-list" v-if="showNotifications" ref="popup">
        <NotificationItems />
        <MarkAllReadButton />
        <p class="nothing" v-if="notifications.length === 0">
          {{ $t('notification.none') }}<br/>
          <span class="explainer">{{ $t('notification.explainer') }}</span>
        </p>
      </div>
    </CustomTransition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
// ... Other necessary imports ...

const allNotifications = ref<INotification[]>([]);
const showNotifications = ref(false);
const popup = ref(null);
// ... Other necessary variables ...

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => n.readAt === null).length;
});
const notifications = computed(() => {
  return allNotifications.value ? allNotifications.value.filter(n => n.name !== '') : [];
});
const userInfo = computed(() => authStore.info);

// ... Lifecycle hooks, methods, and functions ...

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
}

// Extracted components for better organization
const NotificationItems = {
  // ... Extracted logic for displaying individual notifications ...
};

const MarkAllReadButton = {
  // ... Logic for displaying and handling "Mark All Read" button ...
};
</script>

<style lang="scss" scoped>
/* ... Existing styles ... */
</style>
