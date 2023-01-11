import { TodoistApi } from "npm:@doist/todoist-api-typescript";
const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";
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

const fetchDailyCodingChallenge = async () => {
  console.log(`Fetching daily coding challenge from LeetCode API.`);
  const init = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
  };
  console.log("Fetching json...");
  // deno-lint-ignore no-explicit-any
  let response: any;
  await fetch(LEETCODE_API_ENDPOINT, init)
    .then((json_response) => {
      console.log("Successfully fetched");
      console.log(json_response);
      response = json_response.json();
    })
    .catch((error) => {
      console.log(error);
      Deno.exit(1);
    });
  return response;
};

const createTodoistTask = async (api: TodoistApi, question: Question) => {
  const questionInfo = question.data.activeDailyCodingChallengeQuestion;
  const questionTitle = questionInfo.question.title;
  const questionDifficulty = questionInfo.question.difficulty;
  const questionLink = `https://leetcode.com${questionInfo.link}`;
  const questionId = questionInfo.question.frontendQuestionId;
  let targetSectionId = "";
  await api
    .getSections()
    .then((sections) => {
      console.log("Fetching sections...");
      console.log(sections);
      for (const section of sections) {
        if (section.name === "WIP") { // FIXME: specify the section you want to add the task to
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
      `${questionId}: [${questionTitle}](${questionLink})`,
    description: `Difficulty: ${questionDifficulty}`,
    due_string: "today",
    labels: ["work"], // FIXME: specify the labels you want to add to the task
    section_id: targetSectionId,
  };
  console.log(questionInfo);
  console.log(`Adding Todoist task with title ${questionTitle}...`);
  await api
    .addTask(body)
    .then((project) => {
      console.log("Successfully created task", project);
    })
    .catch((error) => {
      console.log(error);
      Deno.exit(1);
    });
};

const main = async () => {
  const TODOIST_API_TOKEN = Deno.env.get("TODOIST_API_TOKEN");
  if (TODOIST_API_TOKEN === undefined) {
    console.error("TODOIST_API_TOKEN is not set.");
    Deno.exit(1);
  }
  const question = await fetchDailyCodingChallenge();
  const api = new TodoistApi(TODOIST_API_TOKEN);
  createTodoistTask(api, question);
};

main();
