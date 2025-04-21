const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function checkWorkflow() {
  try {
    const { data: runs } = await octokit.actions.listWorkflowRuns({
      owner: 'sobaiapp',
      repo: 'sobai',
      workflow_id: 'ios-release.yml',
      per_page: 1
    });

    if (runs.workflow_runs.length > 0) {
      const run = runs.workflow_runs[0];
      console.log('Latest workflow run:');
      console.log(`Status: ${run.status}`);
      console.log(`Conclusion: ${run.conclusion}`);
      console.log(`URL: ${run.html_url}`);
      
      if (run.conclusion === 'failure') {
        const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
          owner: 'sobaiapp',
          repo: 'sobai',
          run_id: run.id
        });
        
        console.log('\nFailed jobs:');
        jobs.jobs.forEach(job => {
          if (job.conclusion === 'failure') {
            console.log(`- ${job.name}: ${job.html_url}`);
          }
        });

        // Get the logs for the failed job
        const { data: logs } = await octokit.actions.downloadJobLogsForWorkflowRun({
          owner: 'sobaiapp',
          repo: 'sobai',
          job_id: jobs.jobs[0].id
        });
        
        console.log('\nJob logs:');
        console.log(logs);
      }
    } else {
      console.log('No workflow runs found');
    }
  } catch (error) {
    console.error('Error checking workflow:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkWorkflow(); 