'use client';

import styles from './page.module.css';
import { initTransport, getAppAndVersion } from '../lib/ledger';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

import { Stack, Group, Text } from '@mantine/core';
import { TransportOpenUserCancelled } from '@ledgerhq/errors';
import { IconUsb, IconBluetooth } from '@tabler/icons-react';

import Image from 'next/image';
import Header from '../components/header';
import { useViewportSize } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { BiDonateHeart } from 'react-icons/bi';

async function getAppData(router, deviceType = 'usb') {
    if (deviceType === 'demo') {
        return router.push(`/wallet?deviceType=${deviceType}`);
    }

    if (deviceType !== 'usb' && deviceType !== 'bluetooth') {
        throw new Error(`Invalid device type: ${deviceType} - must be "usb" or "bluetooth"`);
    }

    try {
        /**
         * @type {Transport}
         */
        const transport = await initTransport(deviceType);
        const { name } = await getAppAndVersion(transport);

        if (name == 'Karlsen') {
            return router.push(`/wallet?deviceType=${deviceType}`);
        } else {
            notifications.show({
                title: 'Action Required',
                message: 'Please open the Karlsen app on your device.',
            });
        }
    } catch (e) {
        if (e instanceof TransportOpenUserCancelled) {
            notifications.show({
                title: 'Action Required',
                message:
                    'WebUSB is not supported in this browser. Please use a compatible browser.',
            });
        } else {
            console.error(e);
            if (e.message) {
                notifications.show({
                    title: 'Action Required',
                    message: `Could not interact with the Ledger device: ${e.message}`,
                });
            } else {
                notifications.show({
                    title: 'Action Required',
                    message: `Could not interact with the Ledger device.`,
                });
            }
        }
    }
}

const WHITELIST = [
    'vault.karlsencoin.com',
];

export default function Home() {
    const router = useRouter();
    const { width } = useViewportSize();
    const [siteHostname, setSiteHostname] = useState('INVALID SITE');
    const [isShowDemo, setIsShowDemo] = useState(false);
    const [commitHash, setCommitHash] = useState('');

    useEffect(() => {
        if (window.location.hostname === 'localhost') {
            setSiteHostname('http://localhost:3000');
        } else {
            for (const currentWhitelist of WHITELIST) {
                if (window.location.hostname === currentWhitelist) {
                    setSiteHostname(`https://${window.location.hostname}`);
                    break;
                }
            }
        }

        setIsShowDemo(window.location.hostname !== 'karlsenvault.io');

        fetch('https://api.github.com/repos/karlsen-network/karlsenvault/commits/main')
            .then(response => response.json())
            .then(data => {
                setCommitHash(data.sha.substring(0, 7));
            })
            .catch(error => console.error('Error fetching commit hash:', error));
    }, []);

    const smallStyles = width <= 48 * 16 ? { fontSize: '1rem' } : {};

    // const demoButton = isShowDemo ? (
    //     <Stack
    //         className={styles.card}
    //         onClick={() => {
    //             getAppData(router, 'demo');
    //         }}
    //         align='center'
    //     >
    //         <h2>
    //             <Group style={smallStyles}>
    //                 <IconBluetooth style={smallStyles} /> Go to Demo Mode <span>-&gt;</span>
    //             </Group>
    //         </h2>
    //         <Text>(Replaced with bluetooth in the future)</Text>
    //     </Stack>
    // ) : null;

    return (
        <Stack className={styles.main}>
            <Header>
                <div>
                    Verify URL is{width <= 465 ? <br /> : <>&nbsp;</>}
                    <code>{siteHostname}</code>
                </div>
            </Header>

            <Group className={styles.center}>
                <Image
                    className={styles.logo}
                    src='/karlsenvault-full-stk.svg'
                    alt='KarlsenVault'
                    width={180}
                    height={180}
                    priority
                />
            </Group>

            <Group>
                {/* {demoButton} */}

                <Stack
                    className={styles.card}
                    onClick={() => {
                        getAppData(router, 'usb');
                    }}
                    align='center'
                >
                    <h2>
                        <Group style={smallStyles}>
                            <IconUsb /> Connect with USB <span>-&gt;</span>
                        </Group>
                    </h2>

                    <Text>All Ledger devices</Text>
                </Stack>
            </Group>

            <footer style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p className="fs-5" style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Made with <span style={{ color: 'red', margin: '0 0.5rem' }}>♥</span> by Kaspa and Karlsen developers
                    <a href="https://github.com/karlsen-network/karlsenvault" target="_blank" rel="noopener noreferrer" className={styles.tooltip} title="Source code">
                        <FaGithub style={{ marginLeft: '0.5rem', width: '20.8px', height: '20.8px', color: 'white' }} />
                    </a>
                    <a href="https://explorer.karlsencoin.com/addresses/karlsen:qqe3p64wpjf5y27kxppxrgks298ge6lhu6ws7ndx4tswzj7c84qkjlrspcuxw" target="_blank" rel="noopener noreferrer" className={styles.tooltip} title="Donation address">
                        <BiDonateHeart style={{ marginLeft: '0.5rem', width: '20.8px', height: '20.8px', color: 'white' }} />
                    </a>
                    &nbsp;&nbsp;|&nbsp;&nbsp; Build version: 
                    <a href={`https://github.com/karlsen-network/karlsenvault/commit/${commitHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'lightgray', marginLeft: '0.5rem' }}>
                        {commitHash}
                    </a>
                </p>
            </footer>
        </Stack>
    );
}
