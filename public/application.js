const button = document.querySelector('.potluckedit');
button && button.addEventListener('submit', async (event)=>{
   event.preventDefault();
    const newName = event.target.parentElement.querySelector('.editname').value;
    const newLoc = event.target.parentElement.querySelector('.editlocation').value;
    const newDate = event.target.parentElement.querySelector('.editdate').value;
    const currentName = document.location.pathname.split('/').splice(document.location.pathname.split('/').indexOf('potlucks')+1,1)[0]
    const response = await fetch(
    `/potlucks/${currentName}`,
    {
        method: 'PUT',
            headers: {
        'Content-Type': 'application/json',
    },
        body: JSON.stringify({
            name: newName,
            location: newLoc,
            date: newDate
        })
    }
    );

    const result = await response.text();
    if(result==="good") {
        window.location = `http://localhost:3000/potlucks/${newName}`
    }
    document.querySelector('.editing').innerHTML = result;
});



const buttonDel = document.querySelector('.deletePot');
buttonDel && buttonDel.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const currentName = document.location.pathname.split('/').splice(document.location.pathname.split('/').indexOf('potlucks')+1,1)[0]
    const response = await fetch(
        `/potlucks/${currentName}`,
        {
            method: 'DELETE',
        }
    );
    const result = await response.text();
    if(result==="success"){
    window.location = 'http://localhost:3000/potlucks'
    }

    // const newName = event.target.parentElement.querySelector('.editname').value;
    // const newLoc = event.target.parentElement.querySelector('.editlocation').value;
    // const newDate = event.target.parentElement.querySelector('.editdate').value;
    // const currentName = document.location.pathname.split('/').splice(document.location.pathname.split('/').indexOf('potlucks')+1,1)[0]
    // const response = await fetch(
    //     `/potlucks/${currentName}`,
    //     {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             name: newName,
    //             location: newLoc,
    //             date: newDate
    //         })
    //     }
    // );
    //
    // const result = await response.text();
    // if(result==="good") {
    //     window.location = `http://localhost:3000/potlucks/${newName}`
    // }
    // document.querySelector('.editing').innerHTML = result;
});
