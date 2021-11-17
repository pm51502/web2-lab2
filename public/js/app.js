function changeSecurityLevel() {
    fetch("/security").then((res) => {
      console.log("Security level changed!");
      location.reload();
    });
}