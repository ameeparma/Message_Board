document.addEventListener("DOMContentLoaded", () => {
    const feed = document.getElementById("feed");
    const postForm = document.getElementById("postForm");
    const messageInput = document.getElementById("message");

    // Sort toggle buttons
    const btnTime = document.getElementById("sortTime");
    const btnVotes = document.getElementById("sortVotes");

    // Remember sort mode from localStorage (default to "time")
    let currentSort = localStorage.getItem("sortMode") || "time";
    updateSortButtons();

    // Handle sort button clicks
    btnTime.onclick = () => {
        currentSort = "time";
        localStorage.setItem("sortMode", currentSort);
        updateSortButtons();
        loadPosts();
    };

    btnVotes.onclick = () => {
        currentSort = "votes";
        localStorage.setItem("sortMode", currentSort);
        updateSortButtons();
        loadPosts();
    };

    function updateSortButtons() {
        if (currentSort === "time") {
            btnTime.classList.add("active");
            btnVotes.classList.remove("active");
        } else {
            btnVotes.classList.add("active");
            btnTime.classList.remove("active");
        }
    }

    // Load posts on page load
    loadPosts();

    // Auto-refresh feed every 60 seconds
    setInterval(loadPosts, 60000);

    // Handle post submission
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message) return;

        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (res.ok) {
            messageInput.value = "";
            loadPosts(); // Refresh the feed
        } else {
            const error = await res.json();
            alert(error.error || "Failed to post.");
        }
    });

    // Load and display posts
    async function loadPosts() {
        const res = await fetch(`/api/posts?sort=${currentSort}`);
        const posts = await res.json();
        feed.innerHTML = "";
        posts.forEach(post => {
            feed.appendChild(createPostElement(post));
        });
    }

    // Create a post <li> element with vote buttons
    function createPostElement(post) {
        const li = document.createElement("li");

        const content = document.createElement("span");
        content.textContent = `${post.content} — ${timeAgo(post.timestamp)}`;

        const voteContainer = document.createElement("div");
        voteContainer.className = "vote-container";

        const voteCount = document.createElement("span");
        voteCount.textContent = `Votes: ${post.votes}`;
        voteCount.className = "vote-count";
        voteCount.id = `vote-${post.id}`;

        const upBtn = document.createElement("button");
        upBtn.textContent = "⬆️";
        upBtn.className = "vote-button";
        upBtn.onclick = () => vote(post.id, "up");

        const downBtn = document.createElement("button");
        downBtn.textContent = "⬇️";
        downBtn.className = "vote-button";
        downBtn.onclick = () => vote(post.id, "down");

        voteContainer.appendChild(voteCount);
        voteContainer.appendChild(upBtn);
        voteContainer.appendChild(downBtn);

        li.appendChild(voteContainer);
        li.appendChild(content);
        return li;
    }

    // Send vote to backend and update feed
    async function vote(postId, direction) {
        const votedPosts = JSON.parse(localStorage.getItem("voted") || "[]");

        if (votedPosts.includes(postId)) {
            alert("You already voted on this post!");
            return;
        }

        const res = await fetch(`/api/posts/${postId}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ direction })
        });

        if (res.ok) {
            votedPosts.push(postId);
            localStorage.setItem("voted", JSON.stringify(votedPosts));
            loadPosts(); // Refresh vote count
        } else {
            const error = await res.json();
            alert(error.error || "Failed to vote.");
        }
    }

    // Time formatting
    function timeAgo(dateString) {
        const now = new Date();
        const postDate = new Date(dateString + "Z");  // force UTC
        const diffMs = now - postDate;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
});
