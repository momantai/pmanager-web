/*
	JS Task board.
*/

socket.on('message', (msg) => {
	console.log("Se ha recibido un mensaje.")
	console.log(msg.typeAction)
	if (msg.isproject == tb.dataconf.project) {
		if (msg.typeAction == 'changeStatus') {
			tb.changeStatus(msg)
		} else if (msg.typeAction == 'deleteTask') {
			tb.deleteTask(msg)
		} else if (msg.typeAction == 'title') {
			tb.applyedit(msg)
		} else if (msg.typeAction == 'newlist') {
			tb.addnewlist(msg)
		} else if (msg.typeAction == 'movetolist') {
			tb.movetask(msg)
		} else {
			tb.addTask(msg)
		}
	}
})

axios.get(urltask)
	.then(response => (tb.task = response.data))

let tb = new Vue({
	el: '#main',
	data: {
		titulo: 'Hola.',
		status: ['Backlog', 'Progress', 'Review', 'Stop'],
		statusEsp: { // Estados en idioma español.
			'Backlog': 'Almacen',
			'Progress': 'En progreso',
			'Review': 'En revisión',
			'Stop': 'Finalizado'
		},
		task: [],
		temptask: [],
		index: {},
		titleItem: "",
		statustem: "backlog",
		tagsItem: [],
		taskdetails: [],
		taskresources: [],
		tagOpt: '',
		opt: {
			'titleEdit': false,
			'descriptionEdit': false
		},
		file: '',
		_idtofile: '',
		url: url,
		todos: [],
		todo: '',
		todotempid: '',
		todobolean: false,
		elmove: "",
		statustask: '',
		namenewlist: '',
		dataconf: {
			'user': '',
			'project': ''
		},
		moveposition: {
			element: '',
			init: '',
			final: '',
			index: 0,
			futureIndex: 0
		}
	},
	methods: { // indexPosition para saber el indice de un estado.

		/******************************************************************
			Area de funciones de los metodos de Drag and Drop para las tareas.
		*/
		onMove: function (evt, originalEvent) {
			this.elmove = evt.draggedContext.element._id
			this.moveposition.element = evt.draggedContext.element._id
			console.log(evt.draggedContext)
			this.moveposition.index = evt.draggedContext.index
			this.moveposition.futureIndex = evt.draggedContext.futureIndex
		},
		onStart: function (evt) {
			this.moveposition.init = evt.from.id
			console.log(evt.from.id)
		},
		End: function (evt) {
			this.moveposition.final = evt.to.id
			console.log(evt.to.id)
			this.moveposition.action = 'movetolist'
			console.log(this.moveposition)

			urllist = url + '/api/' + this.dataconf.user + '/' + this.dataconf.project + '/l'

			axios.post(urllist, qstring.stringify(this.moveposition))
		},
		indexPosition: function (v) {
			for (j = 0; j < this.status.length; j++) {
				if (v == this.status[j]) {
					return j
				}
			}
		},
		movetask: function (mt) {
			index = parseInt(mt.index)
			futureIndex = parseInt(mt.futureIndex)

			try {
				tasktask = this.task.liststodo[this.status[mt.init]].things[index]

				if (tasktask._id == mt.element) {
					this.task.liststodo[this.status[mt.init]].things.splice(index, 1)
					this.task.liststodo[this.status[mt.final]].things.splice(futureIndex, 0, tasktask)
				}
			} catch (error) {
				// console.log(error)
			}
		},
		filterTag: function (tag) { // Para filtrar por etiquetas.
			let temp = []
			this.tagOpt = tag
			for (var i = 0, l = this.task.length; i < l; i++) {
				if (this.task[i].hasOwnProperty('tag') && this.task[i].tag.includes(tag.t)) {
					temp.push(this.task[i])
				}
			}
			this.temptask = temp
			delete temp
		},
		tastap: function () {
			this.status = {}
			for (i = 0, j = this.task.lists.length; i < j; i++) {
				this.status[this.task.lists[i]._id] = i
			}
		},

		/******************************************************************
			Area de tareas de un projecto.
		*/
		newTask: function () { /* Función para crear nueva tarea. */
			if (this.titleItem.trim() != '') {
				axios.post(urltask, qstring.stringify({
					'name': this.titleItem,
					'status': this.statustem,
					'typeAction': 'create',
					'tags': String(this.tagsItem)
				}));

				this.titleItem = "";
				this.statustem = "";
				this.tagsItem = [];
			}
		},
		addTask: function (add) {
			if (add.name != "") {
				this.task.liststodo[this.status[add.status]].things.push({
					_id: add._id,
					name: add.name
				})
			}
		},
		deleteTask: function (dTask) { /* Función para eliminar una tarea. */
			if (dTask.m == '') {
				axios.delete(urltask,
					{
						params: {
							'typeAction': 'deleteTask',
							'id': dTask.i,
							'm': 'rm'
						}
					})
			} else {
				this.task.splice(this.index[dTask.id], 1)
			}
		},
		newnametask: function () {
			d = document.getElementById('textTitle')
			this.opt.titleEdit = false
			axios.put(url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/t/' + this.taskdetails._id, qstring.stringify({
				newTitle: this.taskdetails.name,
				action: 'title',
				sta: this.statustask
			}))

			this.task[this.index[this.taskdetails._id]].work = this.taskdetails.name
		},
		newdetailstask: function () {
			d = document.getElementById('textDescription')
			this.opt.descriptionEdit = false
			this.taskdetails.details = d.innerHTML
			axios.put(url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/t/' + this.taskdetails._id, qstring.stringify({
				newdetails: this.taskdetails.details,
				action: 'description'
			}))
		},

		/******************************************************************
			Area de listas o estados que contienen a las tareas.
		*/
		newlist: function () {
			urlnewlist = url + '/api/' + this.dataconf.user + '/' + this.dataconf.project + '/l'
			this.namenewlist
			axios.post(urlnewlist, qstring.stringify({
				'name': this.namenewlist,
				'action': 'newlist'
			}))
		},
		addnewlist: function (nl) {
			this.task.lists.push({ '_id': nl._id, 'td': nl.td, 'color': nl.color })
			this.task.liststodo.push({ 'things': [], '_thingstoid': nl._id })
			this.status[nl._id] = Object.keys(this.status).length
		},
		applyedit: function (edit) {
			for (i = 0, j = this.task.liststodo[this.status[edit.sta]].things.length; i < j; i++) {
				if (this.task.liststodo[this.status[edit.sta]].things[i]._id == edit._id) {
					this.task.liststodo[this.status[edit.sta]].things[i].name = edit.name
					break
				}
			}
		},

		/******************************************************************
			Otras funciones.
		*/
		changeStatus: function (changeS) { /* F. para cambiar el estado de una tarea. */
			if (changeS.m == '') {
				axios.put(urltask, qstring.stringify({
					typeAction: 'changeStatus',
					_id: changeS.i,
					status: changeS.s,
					move: changeS.t,
					m: 'rm'
				}))
			} else {
				this.task[this.index[changeS._id]].status = changeS.status
			}
		},
		oculteEl: function (idE, classE) {
			if (document.getElementById("Modal").classList.contains("hidden")) {
				document.getElementById("Modal").classList.remove("hidden");
				document.getElementById("inputNItem").focus();
			} else {
				this.$children[0]._data.innerTags = []
				document.getElementById("Modal").classList.add("hidden");
			}
		},
		newItemE: function (statusN) {
			this.statustem = statusN;
			this.oculteEl('Modal', 'hidden')
		},
		taskInformation: function (_id = "", sta) {
			tI = document.getElementById('modal_task')
			tI.classList.toggle('hidden')
			this.statustask = sta
			this._idtofile = _id

			if (_id != "") {
				axios.get(url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/t/' + _id)
					.then((r) => {
						this.taskdetails = r.data.things
						this.taskresources = r.data.resource
					})
				//.then(response => (tb.taskInfo = response.data.task[0]))
			}
		},


		/******************************************************************
			Area Sources and Files de una tarea.
		*/
		nfile: function (event) { // Subir recurso a servidor.
			console.log(event.target.files[0])
			var form = new FormData()
			form.append('file', event.target.files[0])
			form.append('namefile', event.target.files[0].name)
			axios.post(url + '/' + pdataident[0] + '/' + pdataident[1] + '/upFile/' + this._idtofile, form)
				.then(res => {
					if (!this.taskresources.hasOwnProperty('resources')) {
						console.log('Entro!')
						this.taskresources.resources = [{}]
					}
					console.log(res.data)
					this.taskresources.resources.push(res.data)
				})

		},
		bfileset: function () { // ByPass del input file.
			this.$refs.bfiles.click()
		},
		notifi: function () {
			console.log('click a barra')
			let myNotifi = new Notification('Plam', {
				body: 'Esta es una nueva, notificación.'
			})
			myNotifi.onclick = () => {
				console.log('Dio un click')
			}
		},


		/******************************************************************
			Area de 'To-do' dentro de una tarea.
		*/
		addTodo: function () {

			axios.put(url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/t/' + this.taskdetails._id, qstring.stringify({
				action: 'todo',
				actodo: 'create',
				todo: this.todo
			})).then(res => {
				this.taskresources.todo.push(res.data)
				console.log(res.data)
			})

			this.todo = ''


		},
		deleteTodo: function (id) {
			axios.put(url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/t/' + this.taskdetails._id, qstring.stringify({
				action: 'todo',
				actodo: 'delete',
				_id: this.taskresources.todo[id]._id,
			}))
			this.taskresources.todo.splice(id, 1)
		},
		editTodo: function (id) {
			if (this.todobolean) {
				axios.put(url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/t/' + this.taskdetails._id, qstring.stringify({
					action: 'todo',
					actodo: 'update',
					_id: this.taskresources.todo[this.todotempid]._id,
					todo: this.todo,
					check: this.taskresources.todo[this.todotempid].check
				}))

				this.todobolean = false
				this.taskresources.todo[this.todotempid].todo = this.todo
				this.todo = ''
				this.todotempid = ''
			} else {
				this.todobolean = true
				this.todo = this.taskresources.todo[id].todo
				this.todotempid = id
			}
		},
		checkTodo: function (id) {
			checkoption = ''
			if (this.taskresources.todo[id].check == '') {
				checkoption = 'check'
			}

			axios.put(url + '/api/' + pdataident[0] + '/' + pdataident[1] + '/t/' + this.taskdetails._id, qstring.stringify({
				action: 'todo',
				actodo: 'update',
				_id: this.taskresources.todo[id]._id,
				todo: this.taskresources.todo[id].todo,
				check: checkoption
			}))

			this.taskresources.todo[id].check = checkoption

			console.log(this.taskresources.todo[id]._id)
		},
	}
})