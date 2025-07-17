import { SerialPort } from "serialport";
import { type Position, ROBOT_ERRORS } from "./types";
import { delay, fmt } from "./utils";

class Robot {
  port: SerialPort | null = null;
  position: Position | null = null;
  toolIsOpen = false;

  portIsOpen = false;
  constructor() {}

  async connect(comPortName: string): Promise<void> {
    return new Promise((resolve, _error) => {
      const port = new SerialPort({
        path: "/dev/tty.usbserial-141430",
        baudRate: 9600,
        dataBits: 7,
        stopBits: 2,
        parity: "even",
        rts: true,
        dtr: true,
        handshake: "xOnXOff",
      });

      port.on("open", () => {
        console.log(`Connected to port: ${comPortName}`);
        this.port = port;
        resolve();
        this.port.on("data", (data) => {
          console.log("Data received:", data.toString());
        });
        this.port.on("error", (err) => {
          console.error("Error on port:", err);
        });
      });
    });
  }

  isConnected(): boolean {
    return !!this.port?.isOpen;
  }

  private checkPortOpen(): asserts this is this & { port: SerialPort } {
    if (!this.port || !this.port.isOpen) {
      throw new Error("Port is not open");
    }
  }

  async sendCommandNoAnswer(command: string): Promise<void> {
    this.checkPortOpen();

    console.log(`Sending command: ${command}`);
    this.port.write(command + "\r\n");
    await delay(100);
  }

  sendCommandWithAnswer(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.checkPortOpen();

      console.log(`Sending command with answer: ${command}`);

      let stringBuffer = "";
      this.port.write(command + "\r\n", (err) => {
        if (err) {
          console.error("Error writing to port:", err);
          return reject(err);
        }
      });

      this.port.on("data", (data) => {
        stringBuffer += data.toString();
        if (stringBuffer.endsWith("\r\n")) {
          const response = stringBuffer.trim();
          console.log("Response received:", response);
          resolve(response);
          stringBuffer = ""; // Reset buffer after processing
        }
      });
    });
  }

  async checkRobotErrorCode(): Promise<
    { ok: true } | { ok: false; error: ROBOT_ERRORS }
  > {
    this.checkPortOpen();
    const res = await this.sendCommandWithAnswer("ER");
    console.log("Error code response:", res);
    const errorCode = parseInt(res, 10);

    if (Number.isNaN(errorCode)) {
      console.error("Invalid error code received:", res);
      return { ok: false, error: ROBOT_ERRORS.UNKNOWN_ERROR };
    }

    switch (errorCode) {
      case 0:
        console.log("No error detected.");
        return { ok: true };
      case 1:
        console.error("Hardware error: 1");
        return { ok: false, error: ROBOT_ERRORS.HARDWARE_ERROR };
      case 2:
        console.error("Position or format error: 2");
        return { ok: false, error: ROBOT_ERRORS.COMMAND_ERROR };
    }
    return { ok: false, error: ROBOT_ERRORS.UNKNOWN_ERROR };
  }

  async moveTo(position: Position, interpolatePoints = 0): Promise<void> {
    this.checkPortOpen();

    const { x, y, z, p, r } = position;

    if (interpolatePoints === 0) {
      await this.sendCommandNoAnswer(
        `MP ${fmt(x)}, ${fmt(y)}, ${fmt(z)}, ${fmt(p)}, ${fmt(r)}`
      );
    } else {
      await this.sendCommandNoAnswer("PC 1");
      await this.sendCommandNoAnswer(
        `PD 1, ${fmt(x)}, ${fmt(y)}, ${fmt(z)}, ${fmt(p)}, ${fmt(r)}`
      );
      await this.sendCommandNoAnswer(
        `MS 1, ${interpolatePoints}, ${this.toolIsOpen ? "C" : "O"}`
      );
    }
  }

  async requestPosition(): Promise<Position> {
    const response = await this.sendCommandWithAnswer("WH");

    const parts = response.split(",").map((part) => {
      let cleaned = part.trim().replace("+", "");

      if (cleaned.startsWith(".")) {
        cleaned = `0${cleaned}`;
      }
      return parseFloat(cleaned);
    });
    if (parts.length < 5) {
      throw new Error("Invalid position response format");
    }

    const position = {
      x: parts[0],
      y: parts[1],
      z: parts[2],
      p: parts[3],
      r: parts[4],
    };
    this.position = position;

    return position;
  }

  async setGripper(open: boolean): Promise<void> {
    this.checkPortOpen();

    if (open) {
      await this.sendCommandNoAnswer("GO");
    } else {
      await this.sendCommandNoAnswer("GC");
    }

    this.toolIsOpen = open;
  }
  async setSpeed(speed: number): Promise<void> {
    this.checkPortOpen();

    if (speed < 0 || speed > 9) {
      return Promise.reject(new Error("Speed must be between 0 and 9"));
    }

    await this.sendCommandNoAnswer("SP " + Math.floor(speed));
  }

  async setToolLength(length: number): Promise<void> {
    this.checkPortOpen();

    await this.sendCommandNoAnswer(`TL ${Math.floor(length)}`);
  }

  async withCheck<T>(result: Promise<T>): Promise<T> {
    const cbResult = await result;
    const errResult = await this.checkRobotErrorCode();
    if (errResult.ok) {
      return cbResult;
    } else {
      throw new Error(`Command errored: ${errResult.error}`);
    }
  }

  async moveContinuous(points: Position[]): Promise<void> {
    const positionOffset = 1;
    this.checkPortOpen();

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      await this.sendCommandNoAnswer(
        `PD ${i + positionOffset}, ${fmt(point.x)}, ${fmt(point.y)}, ${fmt(
          point.z
        )}, ${fmt(point.p)}, ${fmt(point.r)}`
      );
      await delay(100); // Delay between commands
    }

    await this.sendCommandNoAnswer(
      `MC ${positionOffset}, ${points.length - 1 + positionOffset}`
    );
  }

  disconnect(): void {
    if (this.port) {
      this.port.close((err) => {
        if (err) {
          console.error("Error closing port:", err);
        } else {
          console.log("Port closed successfully.");
        }
      });
      this.port = null;
    } else {
      console.log("No port to close.");
    }
  }

  getPosition() {
    return this.position;
  }
}

export default Robot;
