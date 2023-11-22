//console.log("Hello World")

const a1 = null ?? 20; // Date is object..

// console.log(a1);  // to local time.

// const a2 = [1,2,3,4,5];

    // for(const it of a2)  //but i can not return values
    // {
    //     console.log(it);
    // }

// const data = a2.filter((num)=>{ //direct return value
//     return num>3;
// })

// const data2 = [];

// a2.forEach((num)=>{  
//     if(num>2)
//     {
//         data2.push(num);
//     }
// })

// console.log(data2);

const a11 = [1,2,3,4,5,6];

const ans = a11.reduce((sv,iv)=>{ //acuumelater
    return iv+sv;
},0)

console.log(ans);

