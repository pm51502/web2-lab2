function changeSecurityLevel() {
    fetch("/security").then((res) => {
      console.log("Security level changed!");
      location.reload();
    });
}

function logout() {
  fetch("/logout", {
    method: "post"
  }).then((res) => {
    console.log("Logged out!");
    window.location.href = "/"
  });
}