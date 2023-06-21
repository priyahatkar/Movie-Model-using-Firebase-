const cl = console.log;

const moviesContainer = document.getElementById("moviesContainer")
const showModelBtn = document.getElementById("showModelBtn")
const backDrop = document.getElementById("backDrop")
const myModel = document.getElementById("myModel")
const movieClose = [...document.querySelectorAll(".movieClose")]
const movieForm = document.getElementById("movieForm")
const titleControl = document.getElementById("title")
const imgUrlControl = document.getElementById("imgUrl")
const ratingControl = document.getElementById("rating")
const submitBtn = document.getElementById("submitBtn")
const updateBtn = document.getElementById("updateBtn")
const cancelBtn = document.getElementById("cancelBtn")

const baseUrl = `https://firbase-xhr-default-rtdb.asia-southeast1.firebasedatabase.app`;

const postUrl = `${baseUrl}/posts.json`


let movieArray = [];



const templating = (arr) =>{
    let result = "";

    arr.forEach((post)=>{
        result += `
                <div class="col-md-4 mt-3">
                    <div class="card" id="${post.id}">
                        <div class="card-header text-center">
                            <h2>${post.title}</h2>
                        </div>
                        <div class="card-body py-3">
                            <img src="${post.imgUrl}" alt="" class="img-fluid movieImg">
                        </div>
                        <div class="card-footer">
                            <p>${post.rating}/5</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-danger" onclick="onDelete(this)">Delete</button>
                        </div>
                    </div>
                </div>
            `
    })
    moviesContainer.innerHTML=result;
}


const modelShowHideHandler = () =>{
    myModel.classList.toggle("visible");
    backDrop.classList.toggle("visible");

}

const makeApiCall =(methodName, apiUrl, body) =>{
    return new Promise((resolve, reject)=>{
        let xhr = new XMLHttpRequest();

        xhr.open(methodName,apiUrl)

        xhr.onload = function(){
            if(xhr.status >= 200 || xhr.status <= 300){
                resolve(xhr.response)
            }else{
                reject("something went wrong")
            }
        }
        xhr.send(JSON.stringify(body))
    })
}

makeApiCall("GET", postUrl)
    .then((res)=>{
        let movie = JSON.parse(res)
        // cl(movie)
        for(let k in movie){
            let obj ={
                id : k,
                ...movie[k]
            }
            movieArray.unshift(obj)
        }
        templating(movieArray)
    })
    .catch(cl)

movieForm.addEventListener("submit",(eve) =>{
    eve.preventDefault();
    movieObj ={
        title : titleControl.value,
        imgUrl : imgUrlControl.value,
        rating : ratingControl.value
    }
    makeApiCall("POST", postUrl, movieObj)
    .then((res)=>{
        let data = JSON.parse(res)
        let card = document.createElement("div")
        card.id = data.name
        card.className ="col-md-4 mt-3";
        let result = `
                <div class="card" id="${movieObj.id}">
                    <div class="card-header text-center">
                        <h2>${movieObj.title}</h2>
                    </div>
                    <div class="card-body py-3">
                        <img src="${movieObj.imgUrl}" alt="" class="img-fluid movieImg">
                    </div>
                    <div class="card-footer">
                        <p>${movieObj.rating}/5</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-danger" onclick="onDelete(this)">Delete</button>
                    </div>
                </div>
        `
        card.innerHTML=result;
        moviesContainer.prepend(card)
        movieForm.reset()
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Your post created successfully',
            showConfirmButton: false,
            timer: 1500
        })
    })
    .catch(cl)
    .finally(()=>{
        myModel.classList.toggle("visible");
        backDrop.classList.toggle("visible");
    })
})

const onEdit = (ele) =>{
    let editId = ele.closest(".card").id;
    localStorage.setItem("editId",editId)
    let editUrl =`${baseUrl}/posts/${editId}.json`
    
    makeApiCall("GET", editUrl)
        .then((res)=>{
            let data = JSON.parse(res)
            titleControl.value = data.title,
            imgUrlControl.value = data.imgUrl,
            ratingControl.value = data.rating
        })
        .catch(cl)
        .finally(()=>{
            myModel.classList.toggle("visible");
            backDrop.classList.toggle("visible");
            updateBtn.classList.remove("d-none")
            submitBtn.classList.add("d-none")
        })
}

const onUpdateBtn = (ele) =>{
    let updateId = localStorage.getItem("editId");

    let updateUrl =`${baseUrl}/posts/${updateId}.json`

    let obj ={
        title : titleControl.value,
        imgUrl : imgUrlControl.value,
        rating : ratingControl.value
    }
    makeApiCall("PATCH", updateUrl, obj)
        .then((res)=>{
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Your post successfully updated',
                showConfirmButton: false,
                timer: 1500
            })
            let card = [...document.getElementById(updateId).children];
            card[0].innerHTML = `<h2>${obj.title}</h2>`
            card[1].innerHTML = `<img src="${obj.imgUrl}" alt="" class="img-fluid movieImg">`
            card[2].innerHTML = `<p>${obj.rating}/5</p>`
        })
        .catch(cl)
        .finally(()=>{
            submitBtn.classList.remove("d-none")
            updateBtn.classList.add("d-none")
            myModel.classList.toggle("visible");
            backDrop.classList.toggle("visible");
            movieForm.reset()
        })
}

const onDelete = (ele) =>{
    let deleteId = ele.closest(".card").id;
    let deleteUrl = `${baseUrl}/posts/${deleteId}.json`
    

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
        if (result.isConfirmed) {
            makeApiCall("DELETE", deleteUrl)
            .then((res)=>{
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Your post has been Deleted',
                    showConfirmButton: false,
                    timer: 1500
                })
                let deleteId1 = document.getElementById(deleteId)
                deleteId1.remove()
            })
            .catch(cl)
        }else{
            return
        }
    })

}

cancelBtn.addEventListener("click", (eve)=>{
    movieForm.reset()
    submitBtn.classList.remove("d-none")
    updateBtn.classList.add("d-none")
})


movieClose.forEach(ele =>ele.addEventListener("click", modelShowHideHandler));
showModelBtn.addEventListener("click",modelShowHideHandler)
updateBtn.addEventListener("click", onUpdateBtn)
