import { Test, type TestingModule } from '@nestjs/testing'
import { ProblemController } from './problem.controller'
import { expect } from 'chai'
import { ProblemService } from './problem.service'

describe('ProblemController', () => {
  let controller: ProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemController],
      providers: [{ provide: ProblemService, useValue: {} }]
    }).compile()

    controller = module.get<ProblemController>(ProblemController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})