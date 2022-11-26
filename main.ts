const LEETCODE_API_ENDPOINT = "https://leetcode.com/graphql";
const TODOIST_API_ENDPOINT = "https://api.todoist.com/rest/v1";
const TODOIST_API_TOKEN = Deno.env.get("TODOIST_API_TOKEN");
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

// We can pass the JSON response as an object to our createTodoistTask later.
const fetchDailyCodingChallenge = async () => {
  console.log(`Fetching daily coding challenge from LeetCode API.`);

  const init = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
  };

  const response = await fetch(LEETCODE_API_ENDPOINT, init);
  return response.json();
};

// Passing in the `question` object from fetchDailyCodingChallenge function
const createTodoistTask = async (question: Question) => {
  const questionInfo = question.data.activeDailyCodingChallengeQuestion;

  const questionTitle = questionInfo.question.title;
  const questionDifficulty = questionInfo.question.difficulty;
  const questionLink = `https://leetcode.com${questionInfo.link}`;

  console.log(`Creating Todoist task with title ${questionTitle}.`);

  const body = {
    content: `[${questionTitle}](${questionLink})`,
    description: `Difficulty: ${questionDifficulty}`,
    due_string: "Today",
    priority: 4,
  };

  const init = {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TODOIST_API_TOKEN}`, // Set at environment variable
    },
  };

  const response = await fetch(`${TODOIST_API_ENDPOINT}/tasks`, init);
  return response.json();
};

const main = async () => {
  const question = await fetchDailyCodingChallenge();
  createTodoistTask(question);
};

main();
