import {siteSettings} from './siteSettings'
import {aboutPage, homePage, importantDate, sponsor, submissionPage, track} from './pages'
import {announcement, committee, history, programDay, speaker} from './content'

export const schemaTypes = [
  siteSettings, homePage, aboutPage, submissionPage,
  announcement, track, speaker, committee, programDay, importantDate, history, sponsor,
]
