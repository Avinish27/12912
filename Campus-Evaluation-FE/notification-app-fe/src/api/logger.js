export const Log = async (stack, level, pkg, message) => {
  const payload = {
    stack: String(stack).toLowerCase(),
    level: String(level).toLowerCase(),
    package: String(pkg).toLowerCase(),
    message: message
  };

  try {
    await fetch('http://4.224.186.213/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Injected your working token string directly
        'Authorization': `Bearer ${localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhdmluaXNoYXZpbmlzaDI3MjAwNUBnbWFpbC5jb20iLCJleHAiOjE3ODE2NzQyNDksImlhdCI6MTc4MTY3MzM0OSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImVjMDJlMWNhLWNlZmQtNDg0Zi1iMWRlLTc1YjRiOTBmMTQ5ZiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImF2aW5pc2ggdiIsInN1YiI6ImI0OTNmNmI1LWQwN2YtNDExNy05OGE4LTFiYmRiYTA5ZDQ4YSJ9LCJlbWFpbCI6ImF2aW5pc2hhdmluaXNoMjcyMDA1QGdtYWlsLmNvbSIsIm5hbWUiOiJhdmluaXNoIHYiLCJyb2xsTm8iOiIxMjkxMiIsImFjY2Vzc0NvZGUiOiJqdUZwaHYiLCJjbGllbnRJRCI6ImI0OTNmNmI1LWQwN2YtNDExNy05OGE4LTFiYmRiYTA5ZDQ4YSIsImNsaWVudFNlY3JldCI6IkFKRFVtRXdjSlFzbkdhbUEifQ.skNQbvcOQEkH9vea9YHqw6nzy5dpG5f84nJcmBPycls'}`
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    // Silent fallback to fulfill design criteria
  }
};