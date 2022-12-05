import { TodoistApi } from "npm:@doist/todoist-api-typescript";

const DAILY_CODING_CHALLENGE_QUERY = `
query questionOfToday {
	activeDailyCodingChallengeQuestion {
		date
		userStatus
		link
		question {
			acRate
			difficulty
			freqBar
			frontendQuestionId: questionFrontendId
			isFavor
			paidOnly: isPaidOnly
			status
			title
			titleSlug
			hasVideoSolution
			hasSolution
			topicTags {
				name
				id
				slug
			}
		}
	}
}`;

const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";
const TODOIST_API_TOKEN = Deno.env.get("TODOIST_API_TOKEN");
if (TODOIST_API_TOKEN === undefined) {
  console.error("TODOIST_API_TOKEN is not set.");
  Deno.exit(1);
}

interface Question {
  data: {
    activeDailyCodingChallengeQuestion: {
      date: string;
      userStatus: string;
      link: string;
      question: {
        acRate: string;
        difficulty: string;
        freqBar: string;
        frontendQuestionId: number;
        isFavor: boolean;
        paidOnly: boolean;
        status: string;
        title: string;
        titleSlug: string;
        hasVideoSolution: boolean;
        hasSolution: boolean;
        topicTags: {
          name: string;
          id: number;
          slug: string;
        }[];
      };
    };
  };
}

// We can pass the JSON response as an object to our createTodoistTask later.
const fetchDailyCodingChallenge = async () => {
  console.log(`Fetching daily coding challenge from LeetCode API.`);

  const init = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
  };

  console.log("Fetching json...");
  const response = await fetch(LEETCODE_API_ENDPOINT, init);
  console.log("Successfully fetched\n", response);
  return response.json();
};

// Passing in the `question` object from fetchDailyCodingChallenge function
const createTodoistTask = async (question: Question) => {
  const questionInfo = question.data.activeDailyCodingChallengeQuestion;
  const questionTitle = questionInfo.question.title;
  const questionDifficulty = questionInfo.question.difficulty;
  const questionLink = `https://leetcode.com${questionInfo.link}`;
  const questionId = questionInfo.question.frontendQuestionId;
  const api = new TodoistApi(TODOIST_API_TOKEN);
  let targetSectionId = "";
  await api.getSections()
    .then((sections) => {
      console.log("Fetching sections...");
      console.log(sections);
      for (const section of sections) {
        if (section.name === "WIP") {
          targetSectionId = section.id.toString();
        }
      }
      console.log("Successfully fetched:", targetSectionId);
    })
    .catch((error) => {
      console.log(error);
      Deno.exit(1);
    });
  const body = {
    content:
      `${questionId}: ${questionTitle} [${questionTitle}](${questionLink})`,
    description: `Difficulty: ${questionDifficulty}`,
    due_string: "today",
    labels: ["work"],
    section_id: targetSectionId,
  };
  console.log(questionInfo);
  console.log(`Adding Todoist task with title ${questionTitle}...`);
  await api.addTask(body)
    .then((project) => {
      console.log(project);
      console.log("Successfully created task", project);
    })
    .catch((error) => {
      console.log(error);
      Deno.exit(1);
    });
};

const main = async () => {
  const question = await fetchDailyCodingChallenge();
  createTodoistTask(question);
};

main();
