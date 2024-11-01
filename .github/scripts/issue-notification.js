// import { Octokit } from "@octokit/rest";
// import axios from "axios";
(async () => {
  const { Octokit } = await import("@octokit/rest")
  const { default: axios } = await import('axios');

  // Configuration
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const SLACK_WEBHOOK_URL = process.env.SLACK_ISSUE_NOTIFY_WEBHOOK_URL;
  const MANAGER_SLACK_ID = process.env.DEVELOPER_MANAGER_SLACK_ID;
  const REPO_OWNER = "GreptimeTeam";
  const REPO_NAME = "docs";
  const GITHUB_TO_SLACK = JSON.parse(process.env.GITHUBID_SLACKID_MAPPING);

  const octokit = new Octokit({
    auth: GITHUB_TOKEN
  });

  // Function to fetch open issues from the GitHub repository
  async function fetchOpenIssues() {
    try {
      const issues = await octokit.issues.listForRepo({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        state: "open",  // Only fetch open issues
        per_page: 100   // Fetch 100 issues at a time
      });
      return issues.data;
    } catch (error) {
      console.error("Error fetching issues:", error);
      return [];
    }
  }

  // Function to count issues per assignee
  function countIssuesByAssignee(issues) {
    const issueCountByAssignee = {};

    issues.forEach(issue => {
      const assignees = issue.assignees;
      assignees.forEach(assignee => {
        const username = assignee.login;
        if (!issueCountByAssignee[username]) {
          issueCountByAssignee[username] = 0;
        }
        issueCountByAssignee[username] += 1;
      });
    });

    const sortedIssueCounts = Object.entries(issueCountByAssignee).sort((a, b) => b[1] - a[1]);

    const sortedIssueCountByAssignee = {};
    sortedIssueCounts.forEach(([username, count]) => {
      sortedIssueCountByAssignee[username] = count;
    });

    return sortedIssueCountByAssignee;
  }

  // Function to send a notification to Slack
  async function sendSlackNotification(issueCounts) {
    const messageLines = [`*🌼 Weekly GitHub Issue Report: 🌼* \n <@${MANAGER_SLACK_ID}>: Hey guys, let's close these issues together! 😉\n`];
    for (const [githubUser, count] of Object.entries(issueCounts)) {
      const slackUserId = GITHUB_TO_SLACK[githubUser];
      const slackMention = slackUserId ? `<@${slackUserId}>` : githubUser;

      const issueLink = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues?q=is%3Aissue+is%3Aopen+assignee%3A${githubUser}`;
      const formattedLine = `${slackMention}: <${issueLink}|${count} open issues>`;

      messageLines.push(formattedLine);
    }

    const message = messageLines.join("\n");

    try {
      const response = await axios.post(SLACK_WEBHOOK_URL, {
        text: message
      });

      if (response.status !== 200) {
        throw new Error(`Error sending Slack notification: ${response.status}`);
      }
      console.log("Notification sent to Slack successfully.");
    } catch (error) {
      console.error("Error sending notification to Slack:", error);
    }
  }

  async function run() {
    const issues = await fetchOpenIssues();
    const issueCounts = countIssuesByAssignee(issues);
    await sendSlackNotification(issueCounts);
  }

  run();
})()

