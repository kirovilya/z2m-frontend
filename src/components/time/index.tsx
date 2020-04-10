import { Component, ComponentChild, ComponentType, h } from "preact";
import { fetchTimeInfo } from "../actions";
import { Device } from "../../types";
import { WSConnect } from "../../utils";
import debounce from "lodash/debounce";

export interface TimeInfo {
    ntp_enable: boolean;
    ntp_server: string;
    tz: string;
    ts: number;
}

export interface TimedProps {
    time: TimeInfo | undefined;
}

interface State {
    time: TimeInfo | undefined;
}


const toHHMMSS = (secs: number): string => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor(secs / 60) % 60;
    const seconds = secs % 60;

    return [hours, minutes, seconds]
        .map(v => v < 10 ? `0${v}` : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
};
export const lastSeen = (device: Device, timeInfo: TimeInfo): string => {
    if (device.last_seen && timeInfo) {
        const lastSeen = timeInfo.ts - device.last_seen;
        if (lastSeen < 0) {
            return "Now";
        }
        return toHHMMSS(lastSeen);
    }
};

const Timed = (WrappedComponent: ComponentType<TimedProps>): ComponentType => {
    return class TimeProviderHOC extends Component<{}, State> {
        time: TimeInfo | undefined;

        constructor(props: unknown) {
            super(props);
            this.state = {
                time: undefined
            };
        }




        fetchTime = () => {
            fetchTimeInfo((err, time: TimeInfo) => {
                if (!err) {
                    this.setState({ time });
                }
            });
        };
        debouncedFetchTime = debounce(this.fetchTime, 10000, { maxWait: 10000 });

        initWs(): void {
            const ws = WSConnect();
            ws.addEventListener("open", () => {
                ws.send(JSON.stringify({ action: "subscribe", category: "zigbee" }));
            });
            ws.addEventListener("message", this.debouncedFetchTime);
        }

        componentDidMount(): void {
            this.fetchTime();
            this.initWs();
        }

        render(): ComponentChild {
            const { time } = this.state;
            return <WrappedComponent {...this.props} time={time} />;
        }
    };
};

export default Timed;
