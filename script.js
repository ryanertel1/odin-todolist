const menuIcon = document.querySelector('.menu-icon');
const addButton = document.querySelector('.add-button');
const menuContainer = document.querySelector('.menu-container');
const listContainer = document.querySelector('.list-container');
const addModal = document.querySelector('.add-modal');
const addModalBg = document.querySelector('.add-modal-bg');
const addForm = document.querySelector('.add-form');
const editForm = document.querySelector('.edit-form');
const noteForm = document.querySelector('.note-form');
const sortForm = document.querySelector('.sort-form');
const addCategoryForm = document.querySelector('.add-category-form');
let categoryList = [];
let todoArray = [];

let listHeight = window.innerHeight - 20 - 50 - 50 - (10*2);
listContainer.style.height = `${listHeight - (listHeight % 33) - 3 - 10}px`;
window.onresize = () => {
	listHeight = window.innerHeight - 20 - 50 - 50 - (10*2);
	listContainer.style.height = `${listHeight - (listHeight % 33) - 3 - 10}px`;
};

class todoInfo {
	constructor(title, importance, dueDate, index, notes, category) {
		this.title = title;
		this.importance = importance;
		this.dueDate = dueDate;
		this.index = index;
		this.notes = notes;
		if (category === undefined) {
			this.category = 'default';
		} else {
			this.category = category;
		}
		this.today = new Date();
	}

	getStartDate() {
		return (`${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);
	}

	get title() {
		return this._title;
	}
	set title(value) {
		this._title = value;
	}
	get importance() {
		return this._importance;
	}
	set importance(value) {
		this._importance = value;
	}
	get dueDate() {
		return this._dueDate;
	}
	set dueDate(value) {
		this._dueDate = value;
	}
	get index() {
		return this._index;
	}
	set index(value) {
		this._index = value;
	}
	get notes() {
		return this._notes;
	}
	set notes(value) {
		this._notes = value;
	}
	get category() {
		return this._category;
	}
	set category(value) {
		this._category = value;
	}
}
function loadData() {
  if (!localStorage.getItem('categoryList')) {
    categoryList.push('default');
    localStorage.setItem('categoryList', JSON.stringify(categoryList)); 
  } else {
    // set values from storage
    categoryList = JSON.parse(localStorage.getItem('categoryList'));
  }
  
  if (localStorage.getItem('todoArray')) {
    const newArray = JSON.parse(localStorage.getItem('todoArray'));
    for (let item of newArray) {
      todoArray.push(new todoInfo(item._title, item._importance, item._dueDate, item._index, item._notes, item._category));
    }
  } else {
    todoArray.push(new todoInfo('test', 'low', '2023-02-18', 0, 'Temp line item: delete me if you would like.', 'default'));
  }
}
loadData();

function todoFactory(todoItem) {
	const newTodo = document.createElement('div');
	newTodo.classList.add('todo-item');
	newTodo.dataset.index = todoItem.index;

	const newImportance = document.createElement('div');
	newImportance.classList.add('importance-mark');
	switch (todoItem.importance) {
		case 'low':
			newImportance.classList.add('low-importance');
			break;
		case 'medium':
			newImportance.classList.add('med-importance');
			break;
		case 'high':
			newImportance.classList.add('high-importance');
			break;
    default: 
      newImportance.classList.add('low-importance');
	}

	function createDragSvg() {
		const newDragSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		newDragSvg.className.baseVal = 'drag-handle';
		newDragSvg.setAttribute('viewBox', '0 0 24 24');
		newDragSvg.setAttribute('height', '24');
		newDragSvg.setAttribute('width', '24');
		const newDragPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		newDragPath.setAttribute('d', 'M20,9H4v2h16V9z M4,15h16v-2H4V15z');
		newDragSvg.appendChild(newDragPath);
		newTodo.appendChild(newDragSvg);
	}
	function createNoteSvg() {
		const newNoteSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		newNoteSvg.className.baseVal = 'note-button';
		newNoteSvg.setAttribute('viewBox', '0 0 24 24');
		newNoteSvg.setAttribute('height', 24);
		newNoteSvg.setAttribute('width', 24);
		const newNotePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		newNotePath.setAttribute('d', 'M18.13 12L19.39 10.74C19.83 10.3 20.39 10.06 21 10V9L15 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.89 21 5 21H11V19.13L11.13 19H5V5H12V12H18.13M14 4.5L19.5 10H14V4.5M19.13 13.83L21.17 15.87L15.04 22H13V19.96L19.13 13.83M22.85 14.19L21.87 15.17L19.83 13.13L20.81 12.15C21 11.95 21.33 11.95 21.53 12.15L22.85 13.47C23.05 13.67 23.05 14 22.85 14.19Z');
		newNoteSvg.appendChild(newNotePath);
		newTodo.appendChild(newNoteSvg);

		newNoteSvg.addEventListener('click', (event) => {
			event.stopPropagation();
			editNote(event.currentTarget.parentNode.dataset.index);
		});
	}
	function createEditSvg() {
		const newEditSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		newEditSvg.className.baseVal = 'edit-button';
		newEditSvg.setAttribute('viewBox', '0 0 24 24');
		newEditSvg.setAttribute('height', 24);
		newEditSvg.setAttribute('width', 24);
		const newEditPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		newEditPath.setAttribute('d', 'M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z');
		newEditSvg.appendChild(newEditPath);
		newTodo.appendChild(newEditSvg);

		newEditSvg.addEventListener('click', (event) => {
			event.stopPropagation();
			editItem(event.currentTarget.parentNode.dataset.index);
		});
	}
	function createDeleteSvg() {
		const newDeleteSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		newDeleteSvg.className.baseVal = 'edit-button';
		newDeleteSvg.setAttribute('viewBox', '0 0 24 24');
		newDeleteSvg.setAttribute('height', 24);
		newDeleteSvg.setAttribute('width', 24);
		const newDeletePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		newDeletePath.setAttribute('d', 'M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z');
		newDeleteSvg.appendChild(newDeletePath);
		newTodo.appendChild(newDeleteSvg);

		newDeleteSvg.addEventListener('click', (event) => {
			event.stopPropagation();
			deleteItem(event.currentTarget.parentNode.dataset.index);
		});
	}

	const newTitle = document.createElement('text');
	newTitle.classList.add('title-text');
	newTitle.innerHTML = todoItem.title;

	const newDueDate = document.createElement('text');
	newDueDate.classList.add('date-text');
	newDueDate.innerHTML = todoItem.dueDate;

	newTodo.appendChild(newImportance);
	createDragSvg();
	newTodo.appendChild(newTitle);
	createNoteSvg();
	newTodo.appendChild(newDueDate);
	listContainer.appendChild(newTodo);
	createEditSvg();
	createDeleteSvg();
}
// Temporarily initialize a few test todo items
// function tempCreateItems() {
// 	todoArray[0] = new todoInfo('first', 'low', '2023-02-13', 0, '');
// 	todoArray[1] = new todoInfo('second', 'medium', '2023-02-15', 1, '');
// 	todoArray[2] = new todoInfo('third', 'high', '2023-02-17', 2, '');
// 	todoArray[3] = new todoInfo('first', 'low', '2023-02-13', 0, '');
// }
// tempCreateItems();

function generateList(sortBy) {
	while (listContainer.firstChild) {
		listContainer.removeChild(listContainer.lastChild);
	}
	let newIndex = 0;
	for (item of todoArray) {
		if(sortBy === undefined || item.category === sortBy || sortBy === 'default') {
			item.index = newIndex;
			todoFactory(item);
		}
		newIndex++;
	}
  localStorage.setItem('todoArray', JSON.stringify(todoArray));
}
function exitModal() {
	addForm.style.display = 'none';
	editForm.style.display = 'none';
	noteForm.style.display = 'none';
	addModal.style.webkitAnimation = '';
	addModal.style.animation = '';
	addModalBg.style.webkitAnimation = '';
	addModalBg.style.animation = '';
	addModalBg.style.scale = '0';
}
function editItem(index) {
	editForm.style.display = 'grid';
	const titleInput = editForm.querySelector('[name="title"]');
	const dueDateInput = editForm.querySelector('[name="dueDate"]');
	const importanceInput = editForm.querySelector('[name="importance"]');
	const notesInput = editForm.querySelector('[name="notes"]');
	const categoryInput = editForm.querySelector('[name="category"]');

	addModal.style.animation = 'modal-in 0.3s forwards';
	addModalBg.style.animation = 'modal-bg-in 0.3s forwards';
	addModalBg.style.scale = '1';
	
	titleInput.value = todoArray[index].title;
	dueDateInput.value = todoArray[index].dueDate;
	importanceInput.value = todoArray[index].importance;
	notesInput.value = todoArray[index].notes;
	
	editForm.addEventListener('submit', (event) => {
		event.preventDefault();
		todoArray[index].title = titleInput.value;
		todoArray[index].dueDate = dueDateInput.value;
		todoArray[index].importance = importanceInput.value;
		todoArray[index].notes = notesInput.value;
		todoArray[index].category = categoryInput.value;
		generateList();
		exitModal();
	});
}
function editNote(index) {
	noteForm.style.display = 'grid';
	const notesInput = noteForm.querySelector('[name="notes"]');

	addModal.style.animation = 'modal-in 0.3s forwards';
	addModalBg.style.animation = 'modal-bg-in 0.3s forwards';
	addModalBg.style.scale = '1';

	notesInput.value = todoArray[index].notes;

	noteForm.addEventListener('submit', (event) => {
		event.preventDefault();
		todoArray[index].notes = notesInput.value;
		generateList();
		exitModal();
	});
}
function deleteItem(index) {
	todoArray.splice(index, 1);
	generateList();
}
function generateCategories() {
	let categorySelect = []; 
	categorySelect.push(addForm.querySelector('[name="category"]'));
	categorySelect.push(editForm.querySelector('[name="category"]'));
	categorySelect.push(sortForm.querySelector('[name="sort-select"]'));
	
	while (categorySelect[0].firstChild) {
		categorySelect[0].removeChild(categorySelect[0].lastChild);
		categorySelect[1].removeChild(categorySelect[1].lastChild);
		categorySelect[2].removeChild(categorySelect[2].lastChild);
	}

	for (category of categoryList) {
		categorySelect[0].add(new Option(category[0].toUpperCase() + category.substring(1), category));
		categorySelect[1].add(new Option(category[0].toUpperCase() + category.substring(1), category));
		categorySelect[2].add(new Option(category[0].toUpperCase() + category.substring(1), category));
	}
  localStorage.setItem('categoryList', JSON.stringify(categoryList));

}

menuIcon.addEventListener('click', () => {
	if (menuIcon.style.transform === '') {
		menuIcon.style.transform = 'rotateZ(90deg)';
		menuIcon.style.fill = 'var(--accent-secondary)';
		menuContainer.style.webkitAnimation = 'slideIn 1.5s forwards ease'
		menuContainer.style.animation = 'slideIn 1.5s forwards ease'
	} else {
		menuIcon.style.transform = '';
		menuContainer.style.webkitAnimation = 'slideOut 1s forwards ease-in'
		menuContainer.style.animation = 'slideOut 1s forwards ease-in'
	}
});
addButton.addEventListener('click', () => {
	addForm.style.display = 'grid';
	addModal.style.webkitAnimation = 'modal-in 0.3s forwards';
	addModalBg.style.webkitAnimation = 'modal-bg-in 0.3s forwards';
	addModal.style.animation = 'modal-in 0.3s forwards';
	addModalBg.style.animation = 'modal-bg-in 0.3s forwards';
	addModalBg.style.scale = '1';
});
addModalBg.addEventListener('click', () => exitModal());
addForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const title = addForm.querySelector('[name="title"]').value;
	const dueDate = addForm.querySelector('[name="dueDate"]').value;
	const importance = addForm.querySelector('[name="importance"]').value;
	const notes = addForm.querySelector('[name="notes"]').value;
	const category = addForm.querySelector('[name="category"]').value;
	todoArray.push(new todoInfo(title, importance, dueDate, (todoArray.length), notes, category));
	generateList();
	exitModal();
});
addCategoryForm.addEventListener('submit', (event) => {
	event.preventDefault();
	categoryList.push(addCategoryForm.querySelector('[name="add-category-text"]').value);
	generateCategories();
});
sortForm.addEventListener('submit', (event) => {
	event.preventDefault();
	generateList(sortForm.querySelector('[name="sort-select"]').value);
});

const sortText = document.querySelector('.sort-text');
const addCategoryText = document.querySelector('.add-category-text');
sortText.addEventListener('click', () => {
	const sortForm = document.querySelector('.sort-form');
	if (sortForm.style.display === 'flex') {
		sortForm.style.animation = 'collapseForm 0.4s forwards';
		setTimeout(() => {  sortForm.style.display = 'none'; }, 390);
	} else {
		sortForm.style.display = 'flex';
		sortForm.style.animation = 'expandForm 0.4s forwards';
	}
});
addCategoryText.addEventListener('click', () => {
	const addCategoryForm = document.querySelector('.add-category-form');
	if (addCategoryForm.style.display === 'flex') {
		addCategoryForm.style.animation = 'collapseForm 0.4s forwards';
		setTimeout(() => {  addCategoryForm.style.display = 'none'; }, 390);
	} else {
		addCategoryForm.style.display = 'flex';
		addCategoryForm.style.animation = 'expandForm 0.4s forwards';
	}
});

generateList();
generateCategories();

