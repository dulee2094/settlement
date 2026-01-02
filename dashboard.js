// Chart Configuration
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('scalcChart').getContext('2d');

    // Gradient for the chart area
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(100, 100, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(100, 100, 255, 0.05)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['유사사례 1', '유사사례 2', '유사사례 3', '유사사례 4', '유사사례 5', '유사사례 6'],
            datasets: [{
                label: '합의금 분포 (단위: 만원)',
                data: [200, 250, 300, 280, 400, 350],
                backgroundColor: gradient,
                borderColor: '#5865F2',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#5865F2',
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#aaa'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#aaa'
                    }
                }
            }
        }
    });

    // Chat functionality (Mock)
    const chatInput = document.querySelector('.message-input-area input');
    const sendBtn = document.querySelector('.message-input-area button');
    const chatArea = document.getElementById('chatArea');

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add User Message
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message sent';
        msgDiv.textContent = text;
        chatArea.appendChild(msgDiv);

        chatInput.value = '';
        chatArea.scrollTop = chatArea.scrollHeight;

        // Auto Reply (Mock)
        setTimeout(() => {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'message received';
            replyDiv.textContent = '네, 확인했습니다. 변호사를 통해 검토 후 다시 답변 드리겠습니다.';
            chatArea.appendChild(replyDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 1500);
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
