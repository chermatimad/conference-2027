import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'k6sogxhu', dataset: 'production'},
  studioHost: 'conference-2027', // https://conference-2027.sanity.studio
})
