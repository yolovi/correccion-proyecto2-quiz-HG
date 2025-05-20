let userName = "";
    let questions = [];
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = [];

    const homeDiv = document.getElementById("home");
    const questionsDiv = document.getElementById("questions");
    const resultsDiv = document.getElementById("results");
    const startForm = document.getElementById("start-form");
    const usernameInput = document.getElementById("username");
    const lastResultsDiv = document.getElementById("last-results");
    const questionNumberDiv = document.getElementById("question-number");
    const questionTextDiv = document.getElementById("question-text");
    const optionsDiv = document.getElementById("options");
    const nextBtn = document.getElementById("next-btn");
    const scoreDiv = document.getElementById("score");
    const restartBtn = document.getElementById("restart-btn");
    const chartCanvas = document.getElementById("chart");

    function showLastResults() {
      const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
      if (results.length === 0) {
        lastResultsDiv.innerHTML = "";
        return;
      }
      let html = "<h5>Últimos resultados:</h5><ul>";
      results
        .slice(-5)
        .reverse()
        .forEach((r) => {
          html += `<li><strong>${r.name}</strong>: ${r.score}/10</li>`;
        });
      html += "</ul>";
      lastResultsDiv.innerHTML = html;
    }

    startForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      userName = usernameInput.value.trim();
      if (!userName) return;
      homeDiv.classList.add("hidden");
      await fetchFootballQuestions();
      showQuestion();
      questionsDiv.classList.remove("hidden");
    });

    // Fetch preguntas de categoría Deportes y filtrar las que contengan "fútbol"
    async function fetchFootballQuestions() {
      const url =
        "https://opentdb.com/api.php?amount=50&category=21&type=multiple&encode=url3986&lang=es";
      const res = await fetch(url);
      const data = await res.json();

      // Filtrar preguntas que contengan 'fútbol' (o 'football') en pregunta o respuestas
      const footballKeywords = ["fútbol", "football", "soccer", "balón"];
      const filtered = data.results.filter((q) => {
        const text = decodeURIComponent(q.question).toLowerCase();
        const correct = decodeURIComponent(q.correct_answer).toLowerCase();
        const incorrects = q.incorrect_answers.map((a) =>
          decodeURIComponent(a).toLowerCase()
        );
        const hayKeyword =
          footballKeywords.some((kw) => text.includes(kw)) ||
          footballKeywords.some((kw) => correct.includes(kw)) ||
          incorrects.some((ans) => footballKeywords.some((kw) => ans.includes(kw)));
        return hayKeyword;
      });

      // Si no hay suficientes preguntas, usa las que haya (mínimo 10)
      questions = filtered.slice(0, 10).map((q) => {
        const options = [...q.incorrect_answers, q.correct_answer].map((opt) =>
          decodeURIComponent(opt)
        );
        // Mezclar opciones
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        return {
          question: decodeURIComponent(q.question),
          options,
          correct: decodeURIComponent(q.correct_answer),
        };
      });

      // Si no hay 10 preguntas, rellena con preguntas genéricas de fútbol (hardcode)
      if (questions.length < 10) {
        const faltan = 10 - questions.length;
        const extraQuestions = [
          {
            question: "¿Qué país ganó la Copa Mundial de Fútbol en 2018?",
            options: ["Francia", "Brasil", "Alemania", "Argentina"],
            correct: "Francia",
          },
          {
            question: "¿Cuál es el máximo goleador histórico del FC Barcelona?",
            options: ["Lionel Messi", "César Rodríguez", "Luis Suárez", "Neymar"],
            correct: "Lionel Messi",
          },
          {
            question: "¿En qué año se fundó el Real Madrid?",
            options: ["1902", "1899", "1910", "1920"],
            correct: "1902",
          },
          {
            question: "¿Quién ganó el Balón de Oro en 2021?",
            options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Neymar"],
            correct: "Lionel Messi",
          },
          {
            question: "¿Cuál es el estadio del club Manchester United?",
            options: ["Old Trafford", "Anfield", "Camp Nou", "Santiago Bernabéu"],
            correct: "Old Trafford",
          },
          {
            question: "¿Qué selección nacional tiene más títulos de la Copa América?",
            options: ["Uruguay", "Argentina", "Brasil", "Chile"],
            correct: "Uruguay",
          },
          {
            question: "¿Quién es conocido como 'La Pulga'?",
            options: ["Lionel Messi", "Diego Maradona", "Pelé", "Cristiano Ronaldo"],
            correct: "Lionel Messi",
          },
          {
            question: "¿Cuántos jugadores hay en un equipo de fútbol en el campo?",
            options: ["11", "10", "12", "9"],
            correct: "11",
          },
          {
            question: "¿Qué país organizó la Copa Mundial de Fútbol de 2014?",
            options: ["Brasil", "Alemania", "Sudáfrica", "Rusia"],
            correct: "Brasil",
          },
          {
            question: "¿Quién es el máximo goleador histórico de la selección española?",
            options: ["David Villa", "Raúl González", "Fernando Torres", "Iker Casillas"],
            correct: "David Villa",
          },
        ];
        questions = questions.concat(extraQuestions.slice(0, faltan));
      }

      currentQuestion = 0;
      score = 0;
      userAnswers = [];
    }

    function showQuestion() {
      nextBtn.classList.add("hidden");
      optionsDiv.innerHTML = "";
      const q = questions[currentQuestion];
      questionNumberDiv.textContent = `Pregunta ${currentQuestion + 1} de 10`;
      questionTextDiv.textContent = q.question;
      q.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary option-btn";
        btn.textContent = option;
        btn.onclick = () => selectOption(btn, option);
        optionsDiv.appendChild(btn);
      });
    }

    function selectOption(btn, selected) {
      Array.from(optionsDiv.children).forEach((b) => {
        b.disabled = true;
        if (b.textContent === questions[currentQuestion].correct) {
          b.classList.replace("btn-outline-primary", "btn-success");
        } else if (b === btn) {
          b.classList.replace("btn-outline-primary", "btn-danger");
        }
      });
      userAnswers.push(selected);
      if (selected === questions[currentQuestion].correct) score++;
      nextBtn.classList.remove("hidden");
    }

    nextBtn.addEventListener("click", () => {
      currentQuestion++;
      if (currentQuestion < questions.length) {
        showQuestion();
      } else {
        showResults();
      }
    });

    function showResults() {
      questionsDiv.classList.add("hidden");
      resultsDiv.classList.remove("hidden");
      scoreDiv.innerHTML = `<h4>${userName}, tu puntuación es: ${score} / 10</h4>`;
      saveResult();
      drawChart();
    }

    function saveResult() {
      const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
      results.push({ name: userName, score });
      localStorage.setItem("quizResults", JSON.stringify(results));
    }

    function drawChart() {
      const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
      const last = results.slice(-5);
      if (last.length === 0) {
        chartCanvas.style.display = "none";
        return;
      }
      chartCanvas.style.display = "block";
      const names = last.map((r) => r.name);
      const scores = last.map((r) => r.score);
      if (window.quizChart) window.quizChart.destroy();
      window.quizChart = new Chart(chartCanvas, {
        type: "bar",
        data: {
          labels: names,
          datasets: [
            {
              label: "Puntuación",
              data: scores,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        },
        options: {
          scales: { y: { beginAtZero: true, max: 10 } },
        },
      });
    }

    restartBtn.addEventListener("click", () => {
      resultsDiv.classList.add("hidden");
      homeDiv.classList.remove("hidden");
      usernameInput.value = "";
      showLastResults();
    });

    showLastResults();
