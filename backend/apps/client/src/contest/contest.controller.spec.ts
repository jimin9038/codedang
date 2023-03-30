import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { GroupService } from '@client/group/group.service'
import { PrismaService } from '@client/prisma/prisma.service'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

describe('ContestController', () => {
  let controller: ContestController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestController],
      providers: [
        ConfigService,
        { provide: GroupService, useValue: {} },
        { provide: ContestService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<ContestController>(ContestController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})