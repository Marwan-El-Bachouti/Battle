async function get_troops() {
    try {
        const response = await fetch(`/api/troops`);
        if (response.status == 200) {
           var troops = await response.json();
           return troops;
        } else {
            // Treat errors like 404 here
            console.log(response);
        }
    } catch (err) {
        // Treat 500 errors here    
        console.log(err);
    }
}           

async function get_troops_by_id(id) {
    try {
        const response = await fetch(`/api/troops/${id}`);
        if (response.status == 200) {
           var troops = await response.json();
           return troops;
        } else {
            // Treat errors like 404 here
            console.log(response);
        }
    } catch (err) {
        // Treat 500 errors here    
        console.log(err);
    }
}   

// async function update_troops_id(id) {
//     try {
//         const response = await fetch(`/api/troops/update/${id}`);
//         if (response.status == 200) {
//            var troops = await response.json();
//            return troops;
//         } else {
//             // Treat errors like 404 here
//             console.log(response);
//         }
//     } catch (err) {
//         // Treat 500 errors here    
//         console.log(err);
//     }
// }   