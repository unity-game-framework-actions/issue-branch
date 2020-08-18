import * as core from '@actions/core'
import * as utility from './utility'
import * as action from './action'

run()

async function run(): Promise<void> {
  try {
    const issue = core.getInput('issue', {required: true})
    const base = core.getInput('base', {required: true})
    const create = core.getInput('create', {required: true}) === 'true'
    const comment = core.getInput('comment', {required: true}) === 'true'
    const repository = utility.getRepository()
    const config = await utility.readConfigAny()
    const result = await action.createIssueBranch(repository.owner, repository.repo, issue, base, create, comment, config)

    await utility.setOutput(result)
  } catch (error) {
    core.setFailed(error.message)
  }
}
