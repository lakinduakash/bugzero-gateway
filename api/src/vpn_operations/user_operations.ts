import NodeSSH from 'node-ssh'
import {logger} from "../server";

const ssh = new NodeSSH()


export async function connectSSH() {

    if (process.env.SSH_USE_PASSWORD === '1')
        await ssh.connect({
            host: process.env.SSH_HOST,
            username: process.env.SSH_USERNAME,
            password: process.env.SSH_PASSWORD
        })
    else {

        if (!process.env.SSH_PRIVATE_KEY) {
            throw new Error("You should provide private key to connect ssh")
        }

        const data = process.env.SSH_PRIVATE_KEY
        let buff = Buffer.alloc(4096, data, 'base64');
        const privateKey = buff.toString('ascii');

        await ssh.connect({
            host: process.env.SSH_HOST,
            username: process.env.SSH_USERNAME,
            privateKey: privateKey
        })
    }
}

export async function execTest() {

    if (!ssh.connection) {
        await connectSSH()
        logger.info("connected to ssh")
    }

    return new Promise((resolve, reject) => {
        ssh.exec('sudo ls', [], {
            cwd: '/etc/ssh',
            onStdout(chunk) {
                console.log(chunk.toString('utf8'))
                resolve(chunk)
            },
            onStderr(chunk) {
                console.log(chunk.toString('utf8'))
                return reject(chunk)
            },
        })
    })

}
