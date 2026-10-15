// ============================================================
// S2_library-bad.js — Mãos à Obra da Semana 2 (Parte A)
// ============================================================

// SMELL: God Object (a classe Library faz tudo: gerencia acervo, usuários, empréstimos, relatórios e envia e-mails)
// VIOLA: S (Single Responsibility Principle - possui múltiplos motivos para mudar)
class Library {
  constructor() {
    this.bks = []; // SMELL: Nome obscuro (deveria ser "books" ou "livros")
    this.us = [];  // SMELL: Nome obscuro (deveria ser "users" ou "usuarios")
    this.lns = []; // SMELL: Nome obscuro (deveria ser "loans" ou "emprestimos")
  }

  // SMELL: Long Function (método acumula múltiplos fluxos e regras de negócio)
  // SMELL: Switch sobre tipo (usa cadeia de if/else if baseada no parâmetro 'action')
  // VIOLA: O (Open/Closed Principle - precisa modificar o método para adicionar nova ação)
  // VIOLA: S (Single Responsibility Principle)
  doStuff(book, userId, action) {
    if (action === 'add') {
      this.bks.push(book);
      console.log('Added: ' + book.t); // SMELL: Nome obscuro ('book.t' deveria ser 'book.title')
    } else if (action === 'lend') {
      var u = null; // SMELL: Nome obscuro (deveria ser 'user')
      for (var i = 0; i < this.us.length; i++) {
        if (this.us[i].id === userId) { u = this.us[i]; }
      }
      var b = null; // SMELL: Nome obscuro (deveria ser 'book')
      for (var j = 0; j < this.bks.length; j++) {
        if (this.bks[j].t === book.t) { b = this.bks[j]; }
      }
      if (u != null && b != null && b.cp > 0) { // SMELL: Nome obscuro ('b.cp' deveria ser 'copies')
        b.cp = b.cp - 1;
        
        // SMELL: Primitive Obsession (objeto de empréstimo criado de forma bruta sem abstração/classe)
        // SMELL: Magic Number (st: 1 representa status 'ativo')
        this.lns.push({ uid: userId, bt: book.t, d: new Date(), st: 1 });
        
        // SMELL: Comentário-desodorante (comentário existe apenas para explicar os números mágicos do status)
        // 1 = active, 2 = returned, 3 = overdue
        
        // VIOLA: D (Dependency Inversion Principle - acoplamento direto com chamada HTTP/fetch externa sem abstração)
        fetch('http://email.api/send', {
          method: 'POST',
          body: JSON.stringify({ to: u.em, msg: 'Você pegou ' + book.t }) // SMELL: Nome obscuro ('u.em' deveria ser 'user.email')
        }).then(r => { /* nada */ }).catch(e => {}); // SMELL: Erro engolido (catch vazio ignora falhas na API de e-mail)
      }
    } else if (action === 'return') {
      for (var k = 0; k < this.lns.length; k++) {
        // SMELL: Magic Number (st === 1 e st = 2)
        if (this.lns[k].uid === userId && this.lns[k].bt === book.t && this.lns[k].st === 1) {
          this.lns[k].st = 2; // SMELL: Magic Number (2 = devolvido)
          for (var m = 0; m < this.bks.length; m++) {
            if (this.bks[m].t === book.t) { this.bks[m].cp = this.bks[m].cp + 1; }
          }
        }
      }
    } else if (action === 'overdue') {
      for (var n = 0; n < this.lns.length; n++) {
        // SMELL: Magic Number (1000 * 60 * 60 * 24 para converter ms em dias e 7 para prazo limite)
        var diff = (new Date() - this.lns[n].d) / (1000 * 60 * 60 * 24);
        if (this.lns[n].st === 1 && diff > 7) {
          this.lns[n].st = 3; // SMELL: Magic Number (3 = atrasado)
          var usr = null;
          
          // SMELL: Duplicate Code (busca repetida por usuário e por livro já feita na ação 'lend')
          for (var p = 0; p < this.us.length; p++) {
            if (this.us[p].id === this.lns[p].uid) { usr = this.us[p]; }
          }
          if (usr) {
            // SMELL: Duplicate Code (chamada ao fetch repetida para envio de e-mail)
            fetch('http://email.api/send', {
              method: 'POST',
              body: JSON.stringify({ to: usr.em, msg: 'Atrasado: ' + this.lns[n].bt })
            });
          }
        }
      }
    }
  }

  // SMELL: Long Parameter List (8 parâmetros soltos na função)
  // SMELL: Data Clumps (addr, cty, st, zp representam um 'Endereco' que anda sempre junto)
  // SMELL: Primitive Obsession (endereço e dados cadastrais como strings soltas)
  registerUser(n, e, ph, addr, cty, st, zp, isAdm) { // SMELL: Nome obscuro (parâmetros 'n', 'e', 'ph', 'st', 'zp')
    this.us.push({ id: this.us.length + 1, n: n, em: e, ph: ph, addr: addr, cty: cty, st: st, zp: zp, isAdm: isAdm });
  }

  // SMELL: Switch sobre tipo (cadeia de if/else if testando números do tipo de relatório)
  // SMELL: Magic Number (1 = livros, 2 = usuários, 3 = empréstimos)
  // VIOLA: O (Open/Closed Principle - para adicionar novo relatório é preciso alterar este método)
  // CONSERTO: Métodos individuais com nomes expressivos
  reportBooks() {
    console.log(`Total de livros: ${this.books.length}`);
  }

  reportUsers() {
    console.log(`Total de usuários: ${this.users.length}`);
  }

  reportLoans() {
    console.log(`Total de empréstimos: ${this.loans.length}`);
  }
}

// Uso:
const lib = new Library();
lib.registerUser('Ana', 'ana@uepb.edu.br', '83999990000', 'Rua X, 10', 'Patos', 'PB', '58700-000', false);
lib.doStuff({ t: 'Clean Code', cp: 3 }, null, 'add');
lib.doStuff({ t: 'Clean Code' }, 1, 'lend');
lib.report(1);