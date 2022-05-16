import React, { FunctionComponent, ImgHTMLAttributes, Suspense, useEffect } from "react";
import genericDevice from "../../images/generic-zigbee-device.png";
import { Device, DeviceState, OTAState } from "../../types";
import cx from "classnames";
import { sanitizeZ2MDeviceName } from "../../utils";
import style from "./style.css";
import { useTranslation } from "react-i18next";
import { useImage } from 'react-image'

type DeviceImageProps = {
    device: Device;
    deviceStatus?: DeviceState;
    type?: "img" | "svg";
}

const sanitizeModelIDForImageUrl = (modelName: string): string => modelName?.replace("/", "_");

const getZ2mDeviceImage = (device: Device): string => `https://www.zigbee2mqtt.io/images/devices/${sanitizeZ2MDeviceName(device?.definition?.model)}.jpg`;
const getConverterDeviceImage = (device: Device): string | undefined => device.definition?.icon;
const getSlsDeviceImage = (device: Device): string => (`https://slsys.github.io/Gateway/devices/png/${sanitizeModelIDForImageUrl(device.model_id)}.png`);


const AVAILABLE_GENERATORS = [
    getConverterDeviceImage,
    getZ2mDeviceImage,
    getSlsDeviceImage,
];

type LazyImageProps = {
    device: Device;
    type?: "img" | "svg";
}
const LazyImage = (props: LazyImageProps) => {
    const { device, type, ...rest } = props;

    const { src } = useImage({
        srcList: AVAILABLE_GENERATORS
            .map(fn => fn(device))
            .filter(Boolean) as string[]
    });
    if (type === "svg") {
        return <image crossOrigin={"anonymous"} {...rest} href={src} />;
    }
    return <img crossOrigin={"anonymous"} src={src} className={style.img} />
}

const DeviceImage: FunctionComponent<DeviceImageProps & ImgHTMLAttributes<HTMLDivElement | SVGImageElement>> = (props) => {
    const { t } = useTranslation("zigbee");

    const { device = {} as Device, deviceStatus, type = "img", className, ...rest } = props;


    if (type === "svg") {
        return <Suspense fallback={<image crossOrigin={"anonymous"} {...rest} href={genericDevice} />}>
            <LazyImage type="svg" device={device} {...rest}></LazyImage>
        </Suspense>
    }
    const otaState = (deviceStatus?.update ?? {}) as OTAState;
    const otaSpinner = otaState.state === "updating" ? <i title={t("updating_firmware")} className="fa fa-sync fa-spin position-absolute bottom-0 right-0" /> : null;
    const interviewSpinner = device.interviewing ? <i title={t("interviewing")} className="fa fa-spinner fa-spin position-absolute bottom-0 right-0" /> : null;
    const unsuccessfulInterview = !device.interviewing && !device.interview_completed;


    return <div className={cx(className, "position-relative")} {...rest}>
        <Suspense fallback={<img src={genericDevice} className={style.img} />}>
            <LazyImage device={device}></LazyImage>
        </Suspense>
        {interviewSpinner}
        {otaSpinner}
        {unsuccessfulInterview && <i title={t("interview_failed")} className="fa fa-exclamation-triangle position-absolute top-0 right-0 text-danger" />}
    </div>;

}
export default DeviceImage;
