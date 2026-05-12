document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const screens = {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen')
    };
    
    // Buttons
    const gradeBtns = document.querySelectorAll('.grade-btn');
    const answerBtns = document.querySelectorAll('.answer-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    // Displays
    const scoreDisplay = document.getElementById('score');
    const streakDisplay = document.getElementById('streak');
    const questionNumDisplay = document.getElementById('current-question-num');
    const questionDisplay = document.getElementById('question');
    const finalScoreDisplay = document.getElementById('final-score');
    const feedbackDisplay = document.getElementById('feedback-message');
    const appContainer = document.getElementById('app');

    // Game State
    let currentGrade = 1;
    let score = 0;
    let streak = 0;
    let questionCount = 0;
    const maxQuestions = 10;
    let correctAnswer = null;
    let acceptingAnswers = false;
    let timeLeft = 60;
    let timerInterval = null;

    // Initialize Event Listeners
    gradeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentGrade = parseInt(e.target.dataset.grade);
            startGame();
        });
    });

    answerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!acceptingAnswers) return;
            acceptingAnswers = false;
            
            const selectedAnswer = parseFloat(e.target.innerText);
            // using float in case there are division answers that go into decimals (prevented via logic but just in case)
            // wait, parseFloat doesn't work if it strings like "1/2" but we only do integers.
            const isCorrect = selectedAnswer === correctAnswer;

            if (isCorrect) {
                e.target.classList.add('correct');
                score++;
                streak++;
                scoreDisplay.innerText = score;
                streakDisplay.innerText = streak;
                appContainer.style.transform = 'scale(1.02)';
                setTimeout(() => appContainer.style.transform = 'scale(1)', 150);
            } else {
                e.target.classList.add('incorrect');
                streak = 0;
                streakDisplay.innerText = streak;
                
                answerBtns.forEach(b => {
                    if (parseFloat(b.innerText) === correctAnswer) {
                        b.classList.add('correct');
                    }
                });

                appContainer.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 400 });
            }

            setTimeout(() => {
                answerBtns.forEach(b => {
                    b.classList.remove('correct', 'incorrect');
                });
                getNewQuestion();
            }, 1000);
        });
    });

    restartBtn.addEventListener('click', () => {
        showScreen('start');
    });

    function startGame() {
        score = 0;
        streak = 0;
        questionCount = 0;
        timeLeft = 60;
        document.getElementById('time-left').innerText = timeLeft;
        scoreDisplay.innerText = score;
        streakDisplay.innerText = streak;
        
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('time-left').innerText = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);

        showScreen('game');
        getNewQuestion();
    }

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
            // Give it time to display before fading in, or just toggle active
        });
        screens[screenName].classList.add('active');
    }

    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    function generateQuestionData() {
        let n1, n2, operator;
        let ans;
        
        switch (currentGrade) {
            case 0:
                operator = '+';
                n1 = randomInt(1, 5);
                n2 = randomInt(1, 5);
                ans = n1 + n2;
                break;
            case 1:
                operator = Math.random() > 0.5 ? '+' : '-';
                if (operator === '+') {
                    n1 = randomInt(1, 10);
                    n2 = randomInt(1, 10);
                    ans = n1 + n2;
                } else {
                    n1 = randomInt(5, 20);
                    n2 = randomInt(1, n1); // Avoid negative
                    ans = n1 - n2;
                }
                break;
            case 2:
                operator = Math.random() > 0.5 ? '+' : '-';
                if (operator === '+') {
                    n1 = randomInt(10, 50);
                    n2 = randomInt(10, 50);
                    ans = n1 + n2;
                } else {
                    n1 = randomInt(20, 100);
                    n2 = randomInt(5, n1);
                    ans = n1 - n2;
                }
                break;
            case 3:
                operator = Math.random() > 0.5 ? '×' : '÷';
                if (operator === '×') {
                    n1 = randomInt(2, 10);
                    n2 = randomInt(2, 10);
                    ans = n1 * n2;
                } else {
                    n2 = randomInt(2, 10);
                    ans = randomInt(2, 10);
                    n1 = n2 * ans;
                }
                break;
            case 4:
                const ops4 = ['+', '-', '×', '÷'];
                operator = ops4[Math.random() * ops4.length | 0];
                if (operator === '+') {
                    n1 = randomInt(100, 500); n2 = randomInt(100, 500); ans = n1 + n2;
                } else if (operator === '-') {
                    n1 = randomInt(300, 1000); n2 = randomInt(50, n1); ans = n1 - n2;
                } else if (operator === '×') {
                    n1 = randomInt(5, 15); n2 = randomInt(5, 15); ans = n1 * n2;
                } else {
                    n2 = randomInt(3, 12); ans = randomInt(5, 20); n1 = n2 * ans;
                }
                break;
            case 5:
                const ops5 = ['+', '-', '×', '÷'];
                operator = ops5[Math.random() * ops5.length | 0];
                if (operator === '+') {
                    n1 = randomInt(500, 5000); n2 = randomInt(500, 5000); ans = n1 + n2;
                } else if (operator === '-') {
                    n1 = randomInt(1000, 5000); n2 = randomInt(100, n1); ans = n1 - n2;
                } else if (operator === '×') {
                    n1 = randomInt(10, 25); n2 = randomInt(10, 25); ans = n1 * n2;
                } else {
                    n2 = randomInt(5, 20); ans = randomInt(10, 30); n1 = n2 * ans;
                }
                break;
        }

        return { text: `${n1} ${operator} ${n2}`, answer: ans };
    }

    function generateWrongAnswers(correct, count=3) {
        const wrong = new Set();
        while(wrong.size < count) {
            let offset = randomInt(-10, 10);
            if (correct > 100) offset = randomInt(-50, 50);
            if (correct > 1000) offset = randomInt(-200, 200);
            
            if (offset === 0) continue;
            let w = correct + offset;
            if (w < 0 && currentGrade < 4) w = Math.abs(w);
            wrong.add(w);
        }
        return Array.from(wrong);
    }

    function getNewQuestion() {
        questionCount++;
        questionNumDisplay.innerText = questionCount;

        const qData = generateQuestionData();
        correctAnswer = qData.answer;
        questionDisplay.innerText = qData.text;

        const wrongAnswers = generateWrongAnswers(correctAnswer);
        const options = [correctAnswer, ...wrongAnswers];
        options.sort(() => Math.random() - 0.5);

        answerBtns.forEach((btn, index) => {
            btn.innerText = options[index];
            btn.classList.remove('correct', 'incorrect');
        });

        acceptingAnswers = true;
    }

    function endGame() {
        if (timerInterval) clearInterval(timerInterval);
        showScreen('end');
        finalScoreDisplay.innerText = `${score} Correct`;
        
        let percentage = score / questionCount;
        if (questionCount === 0) percentage = 0;
        document.getElementById('percentile').innerText = `${Math.round(percentage * 100)}% Accuracy`;
        
        let feedback = "Keep practicing!";
        if (percentage === 1) feedback = "Perfect Score! You're a Math Master! 🏆";
        else if (percentage >= 0.8) feedback = "Awesome job! 🌟";
        else if (percentage >= 0.5) feedback = "Good effort! Keep it up! 👍";
        else feedback = "Keep practicing, you'll get it next time!";
        
        feedbackDisplay.innerText = feedback;
    }
});
