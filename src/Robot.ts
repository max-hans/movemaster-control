import { SerialPort } from "serialport";
import type { Position } from "./types";
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

  async sendCommandNoAnswer(command: string): Promise<void> {
    if (!this.port) {
      return Promise.reject(new Error("Port is not open"));
    }

    console.log(`Sending command: ${command}`);
    this.port.write(command + "\r\n");
    await delay(100);
    // TODO: Check error codes
    /* var success = await this.CheckRobotErrorCode(); */
    /* if (success == false && this.WriteToConsole) Console.WriteLine($"##ERROR for '{command}'"); */
  }

  /* public async Task<SendCommandAnswer> SendCommandWithAnswer(string command)
        {
            this.comport.WriteLine(command);
            await Task.Delay(100);

            string? responseString = null;
            while (responseString == null)
            {
                await Task.Delay(1);
                responseString = this.ReadResponse()?.Trim(new char[] { '\r', '\n', ' ' });
            }
            var success = await this.CheckRobotErrorCode();
            if (success == false && this.WriteToConsole) Console.WriteLine($"##ERROR for '{command}'");
            return new SendCommandAnswer
            {
                ResponseString = responseString,
                Success = success
            };
        } */

  sendCommandWithAnswer(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        return reject(new Error("Port is not open"));
      }

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

  async moveTo(
    x: number,
    y: number,
    z: number,
    p: number,
    r: number,
    interpolatePoints = false
  ): Promise<void> {
    if (!this.port) {
      return Promise.reject(new Error("Port is not open"));
    }

    if (!interpolatePoints) {
      await this.sendCommandNoAnswer(
        `MP ${fmt(x)}, ${fmt(y)}, ${fmt(z)}, ${fmt(p)}, ${fmt(r)}`
      );
    }
  }

  async getPosition(): Promise<Position> {
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
    if (!this.port) {
      return Promise.reject(new Error("Port is not open"));
    }

    if (open) {
      await this.sendCommandNoAnswer("GC");
    } else {
      await this.sendCommandNoAnswer("GO");
    }

    this.toolIsOpen = open;
  }

  async setToolLength(length: number): Promise<void> {
    if (!this.port) {
      return Promise.reject(new Error("Port is not open"));
    }

    await this.sendCommandNoAnswer(`TL ${Math.floor(length)}`);
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
}

export default Robot;
