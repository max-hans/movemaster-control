import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import robot from "./robot-factory";
import { positionSchema } from "./schemas";

const app = new Hono();
app.get("/", (c) => c.text("Hello Node.js!"));

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/position", async (c) => {
  console.log("Fetching robot position...");
  try {
    const position = robot.getPosition();
    return c.json({ ok: true, position });
  } catch (error) {
    return c.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

app.post(
  "/move",
  zValidator("json", z.object({ position: positionSchema })),
  async (c) => {
    const { position } = c.req.valid("json");
    try {
      await robot.moveTo(position);
      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

app.post(
  "/move-continuous",
  zValidator("json", z.object({ positions: z.array(positionSchema) })),
  async (c) => {
    try {
      await robot.moveContinuous(c.req.valid("json").positions);
      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

app.post(
  "/connect",
  zValidator("json", z.object({ port: z.string() })),
  async (c) => {
    const { port } = c.req.valid("json");

    try {
      await robot.connect(port);
      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);
app.post(
  "/disconnect",

  async (c) => {
    try {
      await robot.disconnect();
      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

app.post(
  "/set-gripper",
  zValidator("json", z.object({ open: z.boolean() })),
  async (c) => {
    const { open } = c.req.valid("json");
    try {
      await robot.setGripper(open);
      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

app.post(
  "/set-speed",
  zValidator("json", z.object({ speed: z.number().int().min(0).max(9) })),
  async (c) => {
    const { speed } = c.req.valid("json");
    try {
      await robot.setSpeed(speed);
      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

app.post(
  "/set-tool-length",
  zValidator("json", z.object({ length: z.number().min(0) })),
  async (c) => {
    const { length } = c.req.valid("json");
    try {
      await robot.setToolLength(length);
      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }
);

serve({ fetch: app.fetch, port: 5123 });
