import * as utility from './utility'
import * as cleanGit from 'clean-git-ref'

export async function createIssueBranch(owner: string, repo: string, number: string, base: string, create: boolean, comment: boolean, config: any, context: any): Promise<string> {
  const issue = await utility.getIssue(owner, repo, number)
  const name = await getUniqueIssueBranchName(owner, repo, number, issue.title)

  if (create) {
    await createBranch(owner, repo, base, name)
  }

  if (comment) {
    const body = getComment(base, name, config, context)

    await createIssueComment(owner, repo, number, body)
  }

  return name
}

async function getUniqueIssueBranchName(owner: string, repo: string, number: string, title: string): Promise<string> {
  const octokit = utility.getOctokit()
  const branches = await octokit.paginate(`GET /repos/${owner}/${repo}/branches`)
  const names = []
  const branchName = getIssueBranchName(number, title)

  let counter = 0
  let result = branchName

  for (const branch of branches) {
    names.push(branch.name)
  }

  while (names.includes(result)) {
    result = `${branchName}-${++counter}`
  }

  return result
}

function getIssueBranchName(number: string, title: string): string {
  return `issue-${number}-${cleanGit.clean(title).toLocaleLowerCase()}`
}

async function createBranch(owner: string, repo: string, base: string, name: string): Promise<void> {
  const octokit = utility.getOctokit()
  const response = await octokit.request(`GET /repos/${owner}/${repo}/git/ref/heads/${base}`)

  await octokit.request(`POST /repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${name}`,
    sha: response.data.object.sha
  })
}

function getComment(base: string, branch: string, config: any, context: any): string {
  const values = {
    context: context,
    base: base,
    branch: branch
  }

  const result = utility.formatValues(config.comment, values)

  return result
}

async function createIssueComment(owner: string, repo: string, number: string, body: string): Promise<void> {
  const octokit = utility.getOctokit()

  await octokit.request(`POST /repos/${owner}/${repo}/issues/${number}/comments`, {
    body: body
  })
}
