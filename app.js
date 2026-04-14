const form = document.getElementById("waitlistForm");
const messageEl = document.getElementById("formMessage");
const yearEl = document.getElementById("year");
const waitlistSubmitBtn = form?.querySelector('button[type="submit"]');
const waitlistButtonDefaultText = waitlistSubmitBtn?.textContent || "Request Access";
const waitlistSheetEndpoint = form?.dataset.sheetEndpoint?.trim() || "";

yearEl.textContent = new Date().getFullYear();

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setMessage(text, type) {
    messageEl.textContent = text;
    messageEl.classList.remove("ok", "error");
    if (type) {
        messageEl.classList.add(type);
    }
}

function setWaitlistSubmittingState(isSubmitting) {
    if (!waitlistSubmitBtn) return;
    waitlistSubmitBtn.disabled = isSubmitting;
    waitlistSubmitBtn.textContent = isSubmitting ? "Submitting..." : waitlistButtonDefaultText;
}

async function submitWaitlistLead(lead) {
    // Google Apps Script web apps usually do not return CORS headers for fetch.
    // no-cors allows the browser to send the POST from a static frontend.
    await fetch(waitlistSheetEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(lead),
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const consent = document.getElementById("consent").checked;

    if (!name || name.length < 2) {
        setMessage("Please enter your full name.", "error");
        return;
    }

    if (!isValidEmail(email)) {
        setMessage("Please enter a valid email.", "error");
        return;
    }

    if (!consent) {
        setMessage("Please accept contact consent to continue.", "error");
        return;
    }

    if (!waitlistSheetEndpoint || waitlistSheetEndpoint.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
        setMessage("Waitlist integration is not configured yet. Add your Google Script URL first.", "error");
        return;
    }

    const lead = {
        name,
        email,
        source: "luma-site",
        created_at: new Date().toISOString(),
    };

    setWaitlistSubmittingState(true);
    setMessage("Submitting your request...", null);

    try {
        await submitWaitlistLead(lead);
        form.reset();
        setMessage("Thanks. You are on the list — we will reach out soon.", "ok");
    } catch (error) {
        console.error("Waitlist submit failed:", error);
        setMessage("Could not submit right now. Please try again in a moment.", "error");
    } finally {
        setWaitlistSubmittingState(false);
    }
});

const micDemoButton = document.getElementById("micDemoButton");
const micDemoState = document.getElementById("micDemoState");
const demoBreathingCircle = document.getElementById("demoBreathingCircle");
const demoMoodText = document.getElementById("demoMoodText");
const speakerState = document.getElementById("speakerState");
const speakerToggle = document.getElementById("speakerToggle");
const demoTranscriptFeed = document.getElementById("demoTranscriptFeed");
const reportDemoButton = document.getElementById("reportDemoButton");
const reportDemoArticle = document.getElementById("reportDemoArticle");

let micDemoActive = false;
let moodIndex = 0;
let speakerIndex = 0;
let transcriptTimer = null;
let transcriptIndex = 0;

const moodOptions = [
    { label: "Calm", color: "#4facfe" },
    { label: "Contemplation", color: "#ef6a5a" },
    { label: "Confusion", color: "#c652de" },
    { label: "Desire", color: "#8e5bff" },
];

const speakerStates = [
    "You are speaking...",
    "James is speaking...",
];

const transcriptDemoSentences = [
    "Take your time... what has been weighing on you lately that made you want to talk today?",
    "Hmm... a tough day with projects. I hear that weight in your voice, like you're carrying something heavy.",
    "Okay... so there's this tension, right? Between the difficulty you're facing and your need for progress.",
    "Let us pause for one breath and identify the part you can control right now.",
    "Good insight. We can turn that into a small action plan for today.",
];

function setMoodDemo(index) {
    const mood = moodOptions[index % moodOptions.length];
    if (!mood || !demoMoodText || !demoBreathingCircle) return;
    demoBreathingCircle.style.setProperty("--demo-mood-color", mood.color);
    demoMoodText.style.setProperty("--demo-mood-color", mood.color);
    demoMoodText.textContent = `Mood: ${mood.label}`;
}

function appendTranscriptDemoLine(sentence) {
    if (!demoTranscriptFeed || !sentence) return;
    const previousActive = demoTranscriptFeed.querySelector(".demo-transcript-line.active");
    if (previousActive) previousActive.classList.remove("active");

    const line = document.createElement("p");
    line.className = "demo-transcript-line active";
    line.textContent = sentence;
    demoTranscriptFeed.appendChild(line);

    while (demoTranscriptFeed.children.length > 16) {
        demoTranscriptFeed.removeChild(demoTranscriptFeed.firstElementChild);
    }

    const viewport = demoTranscriptFeed.parentElement;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
}

if (micDemoButton && micDemoState) {
    micDemoButton.addEventListener("click", () => {
        micDemoActive = !micDemoActive;
        micDemoButton.classList.toggle("is-active", micDemoActive);
        micDemoButton.classList.toggle("is-stop", micDemoActive);
        micDemoButton.setAttribute("aria-pressed", String(micDemoActive));
        micDemoState.textContent = micDemoActive ? "Session active" : "Session idle";
    });
}

if (demoBreathingCircle) {
    setMoodDemo(0);
    demoBreathingCircle.addEventListener("click", () => {
        moodIndex = (moodIndex + 1) % moodOptions.length;
        setMoodDemo(moodIndex);
    });
}

if (speakerState && speakerToggle) {
    speakerState.textContent = speakerStates[0];
    speakerToggle.addEventListener("click", () => {
        speakerIndex = (speakerIndex + 1) % speakerStates.length;
        speakerState.textContent = speakerStates[speakerIndex];
    });
}

if (demoTranscriptFeed) {
    transcriptTimer = window.setInterval(() => {
        appendTranscriptDemoLine(transcriptDemoSentences[transcriptIndex % transcriptDemoSentences.length]);
        transcriptIndex += 1;
    }, 2200);
}

if (reportDemoButton && reportDemoArticle) {
    reportDemoButton.addEventListener("click", () => {
        reportDemoArticle.innerHTML = `
            <h4>Session Overview</h4>
            <p>The user expressed workload pressure with moderate emotional fatigue but remained reflective and solution-focused.</p>
            <h4>Observed Mood Pattern</h4>
            <p>The session moved from calm to contemplative states, followed by moments of confusion that eased with guided prompts.</p>
            <h4>Suggested Next Step</h4>
            <p>Use one breathing reset before deep work and close the day with a short verbal check-in to maintain emotional stability.</p>
        `;
        reportDemoArticle.classList.remove("hidden");
        reportDemoButton.textContent = "Report Generated";
    });
}
