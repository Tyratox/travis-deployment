const http = require("http");
const exec = require("child_process").exec;
const fetch = require("node-fetch");

const createTravisHandler = require("travisci-webhook-handler");

const { PORT, PATH, SCRIPTS } = require("./config.json");

fetch("https://api.travis-ci.com/config")
  .then(response => response.json())
  .then(json => {
    const handler = createTravisHandler({
      path: PATH,
      public_key: json.config.notifications.webhook.public_key
    });

    http
      .createServer((request, response) =>
        handler(request, response, err => {
          response.end("Cheating, eh?");
        })
      )
      .listen(PORT);

    console.log("Server listening on http://localhost:" + PORT);

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

      const name = `${event.payload.repository.owner_name}/${
        event.payload.repository.name
      }#${event.payload.branch}`;

      console.log("Received webhook for", name);

      if (name in SCRIPTS) {
        console.log("Executing", SCRIPTS[name]);
        exec(SCRIPTS[name], (error, stdout, stderr) => {
          if (error || stderr) {
            console.error("ERROR", error, stderr);
          } else {
            console.log("STDOUT", stdout);
          }
        });
      } else {
        console.log("No corresponding script was found!");
      }
    });
  })
  .catch(console.log);
