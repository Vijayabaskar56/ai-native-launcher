const { withAndroidManifest } = require('expo/config-plugins.js');

const withLauncherKit = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];

    if (application) {
      const activities = application.activity || [];

      let mainActivity = activities.find(
        (activity) =>
          activity.$?.['android:name'] === '.MainActivity' ||
          activity.$?.['android:name'] === 'expo.modules.ReactActivityDelegate' ||
          !activity.$?.['android:name']
      );

      if (mainActivity) {
        if (!mainActivity['intent-filter']) {
          mainActivity['intent-filter'] = [];
        }

        const hasLauncherIntent = mainActivity['intent-filter'].some(
          (filter) =>
            filter.action?.some(
              (a) => a.$?.['android:name'] === 'android.intent.action.MAIN'
            ) &&
            filter.category?.some(
              (c) => c.$?.['android:name'] === 'android.intent.category.HOME'
            )
        );

        if (!hasLauncherIntent) {
          mainActivity['intent-filter'].push({
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [
              { $: { 'android:name': 'android.intent.category.HOME' } },
              { $: { 'android:name': 'android.intent.category.DEFAULT' } },
            ],
          });
        }
      }

      // Add NotificationListenerService for media session access
      if (!application.service) {
        application.service = [];
      }

      const hasNotificationListener = application.service.some(
        (s) => s.$?.['android:name'] === 'expo.modules.launcherkit.MediaNotificationListener'
      );

      if (!hasNotificationListener) {
        application.service.push({
          $: {
            'android:name': 'expo.modules.launcherkit.MediaNotificationListener',
            'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
            'android:exported': 'false',
          },
          'intent-filter': [
            {
              action: [
                {
                  $: {
                    'android:name': 'android.service.notification.NotificationListenerService',
                  },
                },
              ],
            },
          ],
        });
      }
    }

    // Add permissions
    if (!manifest.manifest['uses-permission']) {
      manifest.manifest['uses-permission'] = [];
    }

    const permissions = manifest.manifest['uses-permission'];
    const permissionsToAdd = [
      'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.READ_CALENDAR',
      'android.permission.BIND_APPWIDGET',
    ];

    for (const perm of permissionsToAdd) {
      const exists = permissions.some(
        (p) => p.$?.['android:name'] === perm
      );
      if (!exists) {
        permissions.push({ $: { 'android:name': perm } });
      }
    }

    return config;
  });
};

module.exports = withLauncherKit;
