// Question sets grouped by category
const questionBank = {
  Tech: [
    {
      question: "Which language runs in a web browser?",
      options: ["Python", "JavaScript", "C++", "Go"],
      answer: "JavaScript",
    },
    {
      question: "What does CSS stand for?",
      options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
      answer: "Cascading Style Sheets",
    },
    {
      question: "Which HTML tag is used to link a JavaScript file?",
      options: ["<js>", "<script>", "<link>", "<javascript>"],
      answer: "<script>",
    },
    {
      question: "What is the default port for HTTPS?",
      options: ["80", "22", "443", "3000"],
      answer: "443",
    },
    {
      question: "Which company created the TypeScript language?",
      options: ["Google", "Microsoft", "Meta", "Apple"],
      answer: "Microsoft",
    },
  ],
  General: [
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Mars", "Jupiter", "Saturn", "Venus"],
      answer: "Mars",
    },
    {
      question: "How many continents are there?",
      options: ["5", "6", "7", "8"],
      answer: "7",
    },
    {
      question: "Which ocean is the largest?",
      options: ["Atlantic", "Pacific", "Indian", "Arctic"],
      answer: "Pacific",
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["William Shakespeare", "Mark Twain", "Jane Austen", "Charles Dickens"],
      answer: "William Shakespeare",
    },
    {
      question: "What is the capital of Canada?",
      options: ["Toronto", "Vancouver", "Ottawa", "Montreal"],
      answer: "Ottawa",
    },
  ],
};

const questionDuration = 12;
// Core game state
let currentCategory = "";
let questions = [];
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let bonus = 0;
let timer = null;
let timeLeft = questionDuration;
let isLocked = false;

const highScoreKey = "quizHighScore";
const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const categoryChip = document.getElementById("categoryChip");
const questionCounter = document.getElementById("questionCounter");
const questionText = document.getElementById("questionText");
const optionsWrap = document.getElementById("optionsWrap");
const nextBtn = document.getElementById("nextBtn");
const scoreText = document.getElementById("scoreText");
const bonusText = document.getElementById("bonusText");
const progressBar = document.getElementById("progressBar");
const timerText = document.getElementById("timerText");
const timerRing = document.getElementById("timerRing");
const finalScore = document.getElementById("finalScore");
const resultMessage = document.getElementById("resultMessage");
const highScoreText = document.getElementById("highScoreText");
const questionWrap = document.getElementById("questionWrap");
const pointsText = document.getElementById("pointsText");

const updateHighScore = () => {
  const stored = Number(localStorage.getItem(highScoreKey) || 0);
  if (score > stored) {
    localStorage.setItem(highScoreKey, String(score));
  }
  highScoreText.textContent = `High Score: ${localStorage.getItem(highScoreKey) || 0}`;
};

const resetTimer = () => {
  clearInterval(timer);
  timeLeft = questionDuration;
  timerText.textContent = timeLeft;
  timerRing.style.background = `conic-gradient(var(--accent) 0deg, #e5e7eb 0deg)`;

  timer = setInterval(() => {
    timeLeft -= 1;
    timerText.textContent = timeLeft;
    const progress = ((questionDuration - timeLeft) / questionDuration) * 360;
    timerRing.style.background = `conic-gradient(var(--accent) ${progress}deg, #e5e7eb ${progress}deg)`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleTimeout();
    }
  }, 1000);
};

const loadQuestion = () => {
  isLocked = false;
  nextBtn.disabled = true;
  bonus = 0;
  bonusText.textContent = "Bonus: 0";

  const current = questions[currentIndex];
  questionCounter.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  questionText.textContent = current.question;
  optionsWrap.innerHTML = "";

  current.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "btn option-btn py-3";
    btn.textContent = option;
    btn.addEventListener("click", () => selectOption(btn, option));
    optionsWrap.appendChild(btn);
  });

  progressBar.style.width = `${(currentIndex / questions.length) * 100}%`;

  questionWrap.classList.remove("fade-slide");
  void questionWrap.offsetWidth;
  questionWrap.classList.add("fade-slide");

  resetTimer();
};

const selectOption = (button, option) => {
  if (isLocked) return;
  isLocked = true;
  clearInterval(timer);
  nextBtn.disabled = false;

  const current = questions[currentIndex];
  const buttons = optionsWrap.querySelectorAll(".option-btn");

  buttons.forEach((btn) => {
    btn.classList.remove("selected");
    btn.disabled = true;
  });

  button.classList.add("selected");

  if (option === current.answer) {
    button.classList.add("correct");
    bonus = Math.ceil((timeLeft / questionDuration) * 5);
    score += 10 + bonus;
    correctCount += 1;
  } else {
    button.classList.add("wrong");
    buttons.forEach((btn) => {
      if (btn.textContent === current.answer) {
        btn.classList.add("correct");
      }
    });
  }

  bonusText.textContent = `Bonus: ${bonus}`;
  scoreText.textContent = score;
  updateHighScore();
};

const handleTimeout = () => {
  if (isLocked) return;
  isLocked = true;

  const current = questions[currentIndex];
  const buttons = optionsWrap.querySelectorAll(".option-btn");

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === current.answer) {
      btn.classList.add("correct");
    }
  });

  setTimeout(nextQuestion, 900);
};

const nextQuestion = () => {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    loadQuestion();
  } else {
    showResult();
  }
};

const showResult = () => {
  clearInterval(timer);
  quizScreen.classList.add("section-hidden");
  resultScreen.classList.remove("section-hidden");

  finalScore.textContent = `${correctCount}/${questions.length}`;
  pointsText.textContent = `Total points: ${score}`;

  let message = "Nice run!";
  if (score >= questions.length * 13) {
    message = "Legendary pace!";
  } else if (score >= questions.length * 10) {
    message = "Great job, keep pushing.";
  } else if (score >= questions.length * 7) {
    message = "Solid start. One more round?";
  }

  resultMessage.textContent = message;
  updateHighScore();
};

const startQuiz = (category) => {
  currentCategory = category;
  questions = questionBank[category];
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  scoreText.textContent = score;
  bonusText.textContent = "Bonus: 0";
  categoryChip.textContent = category;

  startScreen.classList.add("section-hidden");
  resultScreen.classList.add("section-hidden");
  quizScreen.classList.remove("section-hidden");

  loadQuestion();
  updateHighScore();
};

document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => startQuiz(button.dataset.category));
});

nextBtn.addEventListener("click", nextQuestion);

document.getElementById("restartBtn").addEventListener("click", () => {
  quizScreen.classList.add("section-hidden");
  resultScreen.classList.add("section-hidden");
  startScreen.classList.remove("section-hidden");
  updateHighScore();
});

updateHighScore();
