// تحديث حقول محددة في الإعدادات والصفحة الرئيسية دون المساس بالشعارات والصور وبقية ما عدّلتَه
// التشغيل:  npm run patch-settings
import {getCliClient} from 'sanity/cli'
import {settingsPatch, homePatch} from './docx-content.mjs'

const client = getCliClient({apiVersion: '2024-01-01'})
await client.patch('siteSettings').set(settingsPatch).commit()
await client.patch('homePage').set(homePatch).commit()
console.log('OK: تم تحديث الإعدادات والصفحة الرئيسية')
