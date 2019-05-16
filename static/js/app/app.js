axios.get(url + '/api/projects/momantai')
    .then((response) => {
        vp.dataps = response.data
        console.log(response.data)
    })
    .catch((error) => {
        console.log('Erroooooooor!')
    })
console.log('Obteniendo datos.')

let vp = new Vue({
    el: '#pviews',
    data: {
        dataps: [],
        datap: {},
        idpm: 'Hola'
    },
    computed: {
        clean() {
            cadena = this.idpm
            // Definimos los caracteres que queremos eliminar
            var specialChars = "!@#$^&%*()+=[]\/{}|:<>?,.";

            // Los eliminamos todos
            for (var i = 0; i < specialChars.length; i++) {
                cadena = cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
            }

            // Lo queremos devolver limpio en minusculas
            cadena = cadena.toLowerCase();

            // Quitamos espacios y los sustituimos por _ porque nos gusta mas asi
            cadena = cadena.replace(/ /g, "_");

            // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
            cadena = cadena.replace(/á/gi, "a");
            cadena = cadena.replace(/é/gi, "e");
            cadena = cadena.replace(/í/gi, "i");
            cadena = cadena.replace(/ó/gi, "o");
            cadena = cadena.replace(/ú/gi, "u");
            cadena = cadena.replace(/ñ/gi, "n");
            this.idpm = cadena
            return this.idpm
        }
    },
    methods: {
        modal: function () {
            m = document.getElementById('modal-p')
            m.classList.toggle('hidden')
            this.datap = {}
        },
        modalCreate: function () {
            t = document.getElementById('NUEVOTITULO')
            t.value = ''
            this.idpm = ''
            mC = document.getElementById('modal-c-p')
            mC.classList.toggle('hidden')
            document.getElementById('NUEVOTITULO').focus()
        },
        wCreate: function () {
            nt = document.getElementById('NUEVOTITULO')

            if (nt.value == 0 /*|| this.idpm == 0*/) {
                alert('¡Llena todos los campos!')
            } else {
                data = qstring.stringify({
                    title: nt.value,
                    //_id: this.idpm
                })
                axios.put(url + '/api/projects/' + 'momantai', data)
                    .then((response) => {
                        r = response.data
                        if (/*r.ok*/'ok' != 'ok') {
                            alert('¡Ya tienes un proyecto\ncon ese identificador!')
                        } else {
                            this.dataps.push({ 'leader': r.leader, 'task': [], 'project_id': r.project_id, 'title': r.title })
                            alert('¡Tienes un nuevo proyecto!')
                            nt.value = ''
                            //this.idpm = ''
                            this.modalCreate()
                        }
                    })
            }
        },
        selectProject: function (owner, id) {
            axios.get(url + '/api/project/' + owner + '/' + id)
                .then((response) => {
                    this.modal()
                    this.datap = response.data
                })
                .catch((error) => {

                })
        },
        enterProject: function (owner, id) {
            global.ownerG = owner
            global.projectG = id
            window.location.href = "#pboard"
        },
        updateTitle: function () {
            var t = document.getElementById('TITLE').value

            if (t != this.datap.title && t != '') {
                data = qstring.stringify({
                    title: t,
                    description: this.datap.description,
                    type: 'update'
                })

                axios.put(url + '/api/project/' + this.datap.leader + '/' + this.datap.project_id, data)
                    .then((response) => {
                        console.log(response.data)
                        this.datap.title = t
                    })
            }
        },
        updateDescription: function () {
            d = document.getElementById('DESCRIPTION')
            console.log("HOla")
            if (d != this.datap.description) {
                console.log('ADIOS')
                data = qstring.stringify({
                    title: this.datap.title,
                    description: d.innerText,
                    type: 'update'
                })

                axios.put(url + '/api/project/' + this.datap.leader + '/' + this.datap.project_id, data)
                    .then((response) => {
                        console.log(response.data)
                        this.datap.description = d.innerText
                            .innerText = ''
                    })
            }
        },
        alert: function () {
            a = document.getElementById('alertt')
            a.classList.toggle('displayhidden');
        },
        addCollaborator: function () {
            c = document.getElementById('elcollabora')
            console.log(c)
            data = qstring.stringify({
                collaborator: c.value,
                type: 'addcoll'
            })

            axios.put(url + '/api/project/' + this.datap.owner + '/' + this.datap.proyect_id, data)
                .then((response) => {
                    if (response.data.ok == 'ok') {
                        this.datap.collaborators.push(c.value)
                        c.value = ''
                    } else if (response.data.ok == 'UenP') {
                        alert('Usuario esta trabajando en el proyecto.')
                    } else {
                        alert('¡El usuario no existe aún!\nCuentale a un amigo de Pmanager.')
                    }
                })
        },
        opentaskboard: function(user, project) {
            axios.get(url + '/api/' + user + '/' + project + '/task')
                .then(response => {
                    (tb.task = response.data)
                    tb.dataconf = {'user': user, 'project': project}
                    tb.tastap()
                })
                
                console.log(tb.task)

                pdataident = [user, project]
                urltask = url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/task'

                wboard.style.display = "block";
        }

    }
})