const urlGet = "https://reqres.in/api/users";

async function getUsers(urlGet) {
    try{
        const response = await fetch(urlGet, {
            headers: {
                'x-api-key': 'reqres-free-v1'
            }
        })

        const data = await response.json();
        console.log(data);
    }
    catch (error){
        console.error("Error:", error);
    }
}

getUsers(urlGet);