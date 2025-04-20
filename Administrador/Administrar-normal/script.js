function toggleCursos() {
    const cursoLista = document.getElementById('curso-lista');
    if (cursoLista.style.display === 'none' || cursoLista.style.display === '') {
        cursoLista.style.display = 'block';
    } else {
        cursoLista.style.display = 'none';
    }
}

function openModal() {
    document.getElementById('modalForm').style.display = 'block';
}

function closeModal() {
    document.getElementById('modalForm').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modalForm');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
