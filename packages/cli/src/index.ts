#!/usr/bin/env node
import { ChiApp } from '@chijs/server'

const app = new ChiApp()

await app.start()
