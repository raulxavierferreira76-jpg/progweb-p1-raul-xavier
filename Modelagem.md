# Modelagem — Projeto 1

**Aluno(a):** Raul Xavier Ferreira
**Domínio:** Academia

## 1. O domínio

A academia gerencia matrículas de alunos em planos de acesso. Cada matrícula registra qual
aluno contratou qual plano, a data de início e o status da assinatura. Um aluno só pode realizar
check-in ou acessar as instalações se possuir uma matrícula ativa.

## 2. Entidades

| Entidade | Atributos | Relacionamentos |
|---|---|---|
| Plano | id, nome, valorMensal, limiteAcessosSemanal | está associado a várias matrículas |
| Aluno | id, nome, email, cpf | possui várias matrículas (histórico) |
| Matricula | id, planoId, alunoId, dataInicio, status | pertence a um plano e a um aluno |

## 3. Diagrama de classes

```mermaid
classDiagram
  direction LR

  class Plano {
    +id
    +nome
    +valorMensal
    +limiteAcessosSemanal
    +eInativo()
  }
  class Aluno {
    +id
    +nome
    +email
    +cpf
  }
  class Matricula {
    +id
    +planoId
    +alunoId
    +dataInicio
    +status
    +estaAtiva()
    +cancelar()
    +renovar()
  }

  class MatriculaService {
    +matricular(planoId, alunoId)
    +cancelarMatricula(matriculaId)
    +listarVencidas()
  }

  class PlanoRepository {
    <<contrato>>
    +buscarPorId(id)
    +listar()
    +salvar(plano)
  }
  class AlunoRepository {
    <<contrato>>
    +buscarPorId(id)
    +salvar(aluno)
  }
  class MatriculaRepository {
    <<contrato>>
    +buscarPorId(id)
    +listarAtivas()
    +salvar(matricula)
  }
  class Notificador {
    <<contrato>>
    +enviar(destinatario, mensagem)
  }

  Aluno "1" --> "0..*" Matricula : possui
  Plano "1" --> "0..*" Matricula : associado a

  MatriculaService ..> PlanoRepository : usa
  MatriculaService ..> AlunoRepository : usa
  MatriculaService ..> MatriculaRepository : usa
  MatriculaService ..> Notificador : usa