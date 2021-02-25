export default () => ({

    signin:(email, password) => {
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                let json = {
                    error:'',
                    token:'123',
                    name: 'Paulo da Silva'
                }

                resolve(json);
            }, 1000);
        });
    },

    signup:(name, email, password) => {
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                let json = {
                    error:''
                }

                if(email == 'erro@hotmail.com') {
                    json.error = 'Email já existe!';
                } else {
                    json.token = '123',
                    json.name = 'Paulo da Silva'
                }

                resolve(json);
            }, 1000);
        });
    },

    getRequestPrice: (distance) => {
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                let json = {
                    error:''
                }

                json.price = distance * 7;

                resolve(json);
            }, 1000);
        });
    },

    findDriver: (options) => {
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                let json = {
                    error:''
                }

                json.driver = {
                    name: 'Joseph Albuquerque',
                    avatar: 'https://thumbs.dreamstime.com/b/homem-do-avatar-e-quadrado-colorido-gr%C3%A1fico-73095721.jpg',
                    stars: 4,
                    carName: 'Honda Civic',
                    carColor: 'Branco',
                    carPlate: 'AAA-0000'
                };

                resolve(json);
            }, 3000);
        });
    },

    setRating: (rating) => {
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                let json = {
                    error:''
                };

                resolve(json);
            }, 1000);
        });
    },
});