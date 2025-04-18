<div align="center">
     <h3>VE Checklist</h3>
    <h4>Checklist Tool for OpenText ValueEdge platform.</h4>
    <div align="center">
        <a href="https://chromewebstore.google.com/detail/ve-checklist/aeiiagpokicaeifancpnndjanamdmmdn/reviews">
          <img  src="https://img.shields.io/badge/Google_chrome-4285F4?style=for-the-badge&logo=Google-chrome&logoColor=white">
        </a>
        <a href="https://chromewebstore.google.com/detail/ve-checklist/aeiiagpokicaeifancpnndjanamdmmdn/reviews">
          <img  src="https://img.shields.io/badge/Microsoft_Edge-0078D7?style=for-the-badge&logo=Microsoft-edge&logoColor=white">
        </a>
    </div>
</div>


## Features 🚀
- Displays relevant Definition of Done (DoD) & Definition of Ready (DOR) Checklist based on the currently opened ticket and its status.
- Reminds users to review and complete Checklist when changing ticket phases.
- Users can create their own customized Checklist based on their project requirements.
- Users can add text or HTML notes to each checklist, and these notes will be included in the comments
- Allows users to add completed Checklist in comments to track and maintain a record of the completion status for each item.

## How to 💡
**Use the Extension?**
* Open a ValueEdge ticket in your browser.
* Right-click anywhere on the page.
* In the context menu, you will see an option called **VE Checklist**.
* Click on it to open a pop-up displaying the Done Checklist for the ticket.


#### Example Checklist

```json
{
  "Defect": {
    "categories": {
      "Reproduction": {
        "checklist": [
          "Steps to reproduce the issue are clearly documented",
          "Actual vs expected behavior is described",
          "Screenshots or logs are attached, if applicable"
        ],
        "phases": ["New", "In Progress"]
      },
      "Resolution": {
        "checklist": [
          "Root cause analysis is documented",
          "Solution has been tested and verified",
          "All relevant stakeholders are informed of the fix",
          "Test cases are updated to cover the issue"
        ],
        "phases": ["Done", "Resolved"]
      }
    }
  },
  "Spike": {
    "categories": {
      "Planning": {
        "checklist": [
          "Objective of the spike is clearly defined",
          "Expected deliverables are documented",
          "Team has agreed on a timebox for the spike"
        ],
        "phases": ["New", "In Progress"]
      },
      "Analysis": {
        "checklist": [
          "Relevant research and findings are documented",
          "Any discovered blockers or risks are noted",
          "Recommendations or next steps are provided"
        ],
        "phases": ["Done", "Resolved"]
      }
    }
  }
}
```
**Please note ⚠️**
- The schema is case-sensitive. Ensure that all keys and values match the required casing exactly.
- Whenever you refresh this extension, please do refresh the currently opened ValueEdge pages
