const DO_NOT_CREATE = process.env.DO_NOT_CREATE; // Useful for debugging
const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

export async function createFile(
    path: string,
    content: string
) {
    console.log(`GITHUB CREATE AT ${path}:\n%%%%%%%\n${content}\n%%%%%%%`)
    if (DO_NOT_CREATE) {
        console.log("DO_NOT_CREATE")
        return {}
    }
    const base64_content = Buffer.from(content).toString('base64');
    const github_response = await fetch(`https://api.github.com/repos/mpardalos/mpardalos.com/contents/${path}`, {
        method: 'PUT',
        headers: {
            'User-Agent': 'node', // Github API requires a user-agent header
            'Accept': 'application/json',
            'Authorization': `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            "message": `Micropub: Create ${path}`,
            "content": base64_content
        })
    });
    console.log(`GITHUB RESPONSE: ${github_response}`);
}
