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
    }
    
    return config;
  });
};

module.exports = withLauncherKit;
