const http = require("http");
const exec = require("child_process").exec;

const createTravisHandler = require("travisci-webhook-handler");

const { PORT, PATH, SCRIPTS } = require("./config.json");

fetch("https://api.travis-ci.com/config")
  .then(response => response.json())
  .then(json => {
    const handler = createTravisHandler({
      path: PATH,
      public_key: json.config.notifications.webhook.public_key
    });

    http.createServer(handler).listen(PORT);

    handler.on("error", err => console.error("Error:", err.message));
    handler.on("failure", event => console.log("Build failed!"));
    handler.on("start", event => console.log("Build started!"));

    handler.on("success", event => {
      console.log(
        "Build %s success for %s branch %s",
        event.payload.number,
        event.payload.repository.name,
        event.payload.branch
      );

      const name = `${payload.repository.owner_name}/${
        payload.repository.name
      }#${payload.branch}`;

      if (name in SCRIPTS) {
        exec(SCRIPTS[name], (error, stdout, stderr) => {
          if (error || stderr) {
            console.error(error, stderr);
          } else {
            console.log(stdout);
          }
        });
      }
    });
  })
  .catch(console.log);
