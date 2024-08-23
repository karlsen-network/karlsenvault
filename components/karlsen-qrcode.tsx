import { QRCode } from 'react-qrcode-logo';

export default function KarlsenQrCode(props) {
    return (
        <QRCode
            value={props.value}
            fgColor='#1C3F5E'
            eyeRadius={[
                [10, 10, 0, 10], // top/left eye
                [10, 10, 10, 0], // top/right eye
                [10, 0, 10, 10], // bottom/left
            ]}
            eyeColor={[
                { outer: '#1C3F5E', inner: '#38B6FF' },
                { outer: '#1C3F5E', inner: '#38B6FF' },
                { outer: '#1C3F5E', inner: '#38B6FF' },
            ]}
        />
    );
}
